<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Craftsman;
use Illuminate\Support\Facades\DB;
use Throwable;

class WalletController extends Controller
{
    private function resolveModel(string $type, $id)
    {
        return $type === 'user' ? User::find($id) : Craftsman::find($id);
    }

    private function ensureWallet($model)
    {
        if (!$model->wallet) {
            $model->createWallet([
                'name' => 'Default Wallet',
                'slug' => 'default',
                'description' => 'Main wallet',
                'meta' => [],
            ]);
            $model->refresh();
        }

        return $model->wallet;
    }

    private function formatBalance($wallet): array
    {
        $available = (float) ($wallet->available_balance ?? 0);
        $pending = (float) ($wallet->pending_balance ?? 0);

        return [
            'available' => $available,
            'pending' => $pending,
            'total' => $available + $pending,
        ];
    }

    public function balance($type, $id)
    {
        try {
            if (!in_array($type, ['user', 'craftsman'])) {
                return response()->json(['error' => 'نوع غير صحيح'], 422);
            }

            $model = $this->resolveModel($type, $id);
            if (!$model) {
                return response()->json(['error' => 'المستخدم غير موجود'], 404);
            }

            $wallet = $this->ensureWallet($model);

            return response()->json([
                'balance' => $this->formatBalance($wallet),
                'transactions' => $model->transactions()->latest()->get(),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'error' => 'خطأ في السيرفر: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deposit(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required|integer',
                'type' => 'required|in:user,craftsman',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
            ]);

            $model = $this->resolveModel($request->type, $request->id);
            if (!$model) {
                return response()->json(['error' => 'المستخدم غير موجود'], 404);
            }

            $amount = (float) $request->amount;

            DB::transaction(function () use ($model, $amount, $request) {
                $this->ensureWallet($model);
                $wallet = $model->wallet()->lockForUpdate()->first();

                // نضيف المبلغ مباشرة للـ pending بدون ما نمر بالـ available
                $wallet->pending_balance = (float) $wallet->pending_balance + $amount;
                $wallet->save();

                // نسجل transaction يدوي للتتبع
                DB::table('transactions')->insert([
                    'payable_type' => get_class($model),
                    'payable_id' => $model->id,
                    'wallet_id' => $wallet->id,
                    'type' => 'deposit',
                    'amount' => $amount,
                    'confirmed' => false, // pending
                    'meta' => json_encode([
                        'description' => $request->description ?? 'إيداع في الرصيد المعلق',
                        'status' => 'pending',
                    ]),
                    'uuid' => \Illuminate\Support\Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

            $model->refresh();
            $wallet = $model->wallet;

            return response()->json([
                'balance' => $this->formatBalance($wallet),
                'message' => 'تم إضافة الرصيد إلى المعلّق (Pending) بنجاح',
            ]);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function withdraw(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required|integer',
                'type' => 'required|in:user,craftsman',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
            ]);

            $model = $this->resolveModel($request->type, $request->id);
            if (!$model) {
                return response()->json(['error' => 'المستخدم غير موجود'], 404);
            }

            $wallet = $this->ensureWallet($model);
            $amount = (float) $request->amount;

            if ((float) $wallet->available_balance < $amount) {
                return response()->json(['error' => 'الرصيد المتاح غير كافي'], 400);
            }

            $model->withdraw($amount, [
                'description' => $request->description,
            ]);

            $model->refresh();
            $wallet = $model->wallet;

            return response()->json([
                'balance' => $this->formatBalance($wallet),
                'message' => 'تم السحب بنجاح',
            ]);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function transfer(Request $request)
    {
        try {
            $request->validate([
                'from_type' => 'required|in:user,craftsman',
                'from_id' => 'required|integer',
                'to_type' => 'required|in:user,craftsman',
                'to_id' => 'required|integer',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'nullable|string|max:255',
            ]);

            $from = $this->resolveModel($request->from_type, $request->from_id);
            $to = $this->resolveModel($request->to_type, $request->to_id);

            if (!$from || !$to) {
                return response()->json(['error' => 'أحد المستخدمين غير موجود'], 404);
            }

            $amount = (float) $request->amount;

            DB::transaction(function () use ($from, $to, $amount, $request) {
                $this->ensureWallet($from);
                $this->ensureWallet($to);

                $fromWallet = $from->wallet()->lockForUpdate()->first();
                if ((float) $fromWallet->available_balance < $amount) {
                    throw new \RuntimeException('INSUFFICIENT_AVAILABLE');
                }

                // نطرح من المُرسل (available)
                $fromWallet->available_balance = (float) $fromWallet->available_balance - $amount;
                $fromWallet->save();

                // نضيف للمستلم في pending (مش available)
                $toWallet = $to->wallet()->lockForUpdate()->first();
                $toWallet->pending_balance = (float) $toWallet->pending_balance + $amount;
                $toWallet->save();

                // نسجل transfer transactions يدوي
                $uuid = \Illuminate\Support\Str::uuid();
                
                // Transaction للمُرسل (خصم)
                DB::table('transactions')->insert([
                    'payable_type' => get_class($from),
                    'payable_id' => $from->id,
                    'wallet_id' => $fromWallet->id,
                    'type' => 'withdraw',
                    'amount' => -$amount,
                    'confirmed' => true,
                    'meta' => json_encode([
                        'description' => $request->description ?? 'تحويل رصيد',
                        'to_type' => get_class($to),
                        'to_id' => $to->id,
                    ]),
                    'uuid' => $uuid,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Transaction للمستلم (معلق)
                DB::table('transactions')->insert([
                    'payable_type' => get_class($to),
                    'payable_id' => $to->id,
                    'wallet_id' => $toWallet->id,
                    'type' => 'deposit',
                    'amount' => $amount,
                    'confirmed' => false, // pending
                    'meta' => json_encode([
                        'description' => $request->description ?? 'استلام تحويل',
                        'from_type' => get_class($from),
                        'from_id' => $from->id,
                        'status' => 'pending',
                    ]),
                    'uuid' => $uuid,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

            $from->refresh();
            $to->refresh();

            return response()->json([
                'from_balance' => $this->formatBalance($from->wallet),
                'to_balance' => $this->formatBalance($to->wallet),
                'message' => 'تم التحويل بنجاح (المبلغ للمستلم في Pending)',
            ]);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'INSUFFICIENT_AVAILABLE') {
                return response()->json(['error' => 'الرصيد المتاح غير كافي'], 400);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // تستدعيها من Filament لاعتماد الرصيد المعلق وتحويله للمتاح
    public function approvePending(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required|integer',
                'type' => 'required|in:user,craftsman',
                'amount' => 'nullable|numeric|min:0.01',
            ]);

            $model = $this->resolveModel($request->type, $request->id);
            if (!$model) {
                return response()->json(['error' => 'المستخدم غير موجود'], 404);
            }

            DB::transaction(function () use ($model, $request) {
                $this->ensureWallet($model);

                $wallet = $model->wallet()->lockForUpdate()->first();
                $pending = (float) $wallet->pending_balance;
                $amount = $request->filled('amount') ? (float) $request->amount : $pending;

                if ($amount > $pending) {
                    throw new \RuntimeException('PENDING_NOT_ENOUGH');
                }

                $wallet->pending_balance = $pending - $amount;
                $wallet->available_balance = (float) $wallet->available_balance + $amount;
                $wallet->save();

                // نحدث الـ transactions المعلقة لـ confirmed
                DB::table('transactions')
                    ->where('wallet_id', $wallet->id)
                    ->where('confirmed', false)
                    ->where('type', 'deposit')
                    ->update([
                        'confirmed' => true,
                        'updated_at' => now(),
                    ]);
            });

            $model->refresh();

            return response()->json([
                'balance' => $this->formatBalance($model->wallet),
                'message' => 'تم اعتماد الرصيد المعلّق بنجاح',
            ]);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'PENDING_NOT_ENOUGH') {
                return response()->json(['error' => 'الرصيد المعلق غير كافي'], 400);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // دالة جديدة لرفض الرصيد المعلق وإرجاعه للمُرسل
    public function rejectPending(Request $request)
    {
        try {
            $request->validate([
                'id' => 'required|integer',
                'type' => 'required|in:user,craftsman',
                'amount' => 'required|numeric|min:0.01',
                'reason' => 'nullable|string|max:255',
            ]);

            $model = $this->resolveModel($request->type, $request->id);
            if (!$model) {
                return response()->json(['error' => 'المستخدم غير موجود'], 404);
            }

            DB::transaction(function () use ($model, $request) {
                $this->ensureWallet($model);

                $wallet = $model->wallet()->lockForUpdate()->first();
                $amount = (float) $request->amount;

                if ($amount > (float) $wallet->pending_balance) {
                    throw new \RuntimeException('PENDING_NOT_ENOUGH');
                }

                // نطرح من pending
                $wallet->pending_balance = (float) $wallet->pending_balance - $amount;
                $wallet->save();

                // نسجل transaction رفض
                DB::table('transactions')->insert([
                    'payable_type' => get_class($model),
                    'payable_id' => $model->id,
                    'wallet_id' => $wallet->id,
                    'type' => 'withdraw',
                    'amount' => -$amount,
                    'confirmed' => true,
                    'meta' => json_encode([
                        'description' => 'رفض رصيد معلق: ' . ($request->reason ?? 'بدون سبب'),
                        'status' => 'rejected',
                    ]),
                    'uuid' => \Illuminate\Support\Str::uuid(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });

            $model->refresh();

            return response()->json([
                'balance' => $this->formatBalance($model->wallet),
                'message' => 'تم رفض الرصيد المعلّق',
            ]);
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'PENDING_NOT_ENOUGH') {
                return response()->json(['error' => 'الرصيد المعلق غير كافي'], 400);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        } catch (Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
