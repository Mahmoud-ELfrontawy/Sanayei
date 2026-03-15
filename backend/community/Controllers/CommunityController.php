<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommunityPostResource;
use App\Http\Resources\CommunityCommentResource;
use App\Models\CommunityComment;
use App\Models\CommunityPoint;
use App\Models\CommunityPost;
use App\Models\CommunityPostImage;
use App\Models\CommunityPostInterest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CommunityController extends Controller
{
    /* ═══════════════════════════════════════════════════
     |  Helper: get the authenticated user from any guard
     ═══════════════════════════════════════════════════ */
    private function authUser(Request $request)
    {
        foreach (['sanctum', 'craftsman', 'company'] as $guard) {
            $user = auth($guard)->user();
            if ($user) return $user;
        }
        return null;
    }

    /* ═══════════════════════════════════════════════════
     |  GET /api/community/posts
     |  Public paginated feed
     ═══════════════════════════════════════════════════ */
    public function index(Request $request): JsonResponse
    {
        $query = CommunityPost::with(['user', 'acceptor', 'beforeImages', 'afterImages'])
            ->withCount(['interests', 'comments'])
            ->latest();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('urgency')) {
            $query->where('urgency', $request->urgency);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        $posts = $query->paginate(10);

        return response()->json([
            'data'         => CommunityPostResource::collection($posts->items()),
            'current_page' => $posts->currentPage(),
            'last_page'    => $posts->lastPage(),
            'total'        => $posts->total(),
        ]);
    }

    /* ═══════════════════════════════════════════════════
     |  POST /api/community/posts
     |  Create a post (auth required)
     ═══════════════════════════════════════════════════ */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'       => 'required|string|max:150',
            'description' => 'required|string|max:2000',
            'category'    => 'required|string|in:electrical,plumbing,masonry,carpentry,painting,ac,other',
            'urgency'     => 'required|in:urgent,normal',
            'location'    => 'nullable|string|max:255',
            'latitude'    => 'nullable|numeric',
            'longitude'   => 'nullable|numeric',
            'images'      => 'nullable|array|max:4',
            'images.*'    => 'image|max:5120',
        ]);

        $user = $this->authUser($request);

        DB::beginTransaction();
        try {
            $post = CommunityPost::create([
                'user_id'       => $user->id,
                'title'         => $request->title,
                'description'   => $request->description,
                'category'      => $request->category,
                'urgency'       => $request->urgency,
                'location'      => $request->location,
                'latitude'      => $request->latitude,
                'longitude'     => $request->longitude,
                'points_reward' => $request->urgency === 'urgent' ? 100 : 50,
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('community/before', 'public');
                    CommunityPostImage::create([
                        'community_post_id' => $post->id,
                        'path'              => Storage::url($path),
                        'type'              => 'before',
                    ]);
                }
            }

            DB::commit();
            $post->load(['user', 'acceptor', 'beforeImages', 'afterImages']);
            return response()->json(['data' => new CommunityPostResource($post)], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'حدث خطأ أثناء الحفظ: ' . $e->getMessage()], 500);
        }
    }

    /* ═══════════════════════════════════════════════════
     |  GET /api/community/posts/{id}
     |  Single post detail (public)
     ═══════════════════════════════════════════════════ */
    public function show(int $id, Request $request): JsonResponse
    {
        $post = CommunityPost::with(['user', 'acceptor', 'beforeImages', 'afterImages'])
            ->withCount(['interests', 'comments'])
            ->findOrFail($id);

        return response()->json(['data' => new CommunityPostResource($post)]);
    }

    /* ═══════════════════════════════════════════════════
     |  DELETE /api/community/posts/{id}
     |  Delete own post (auth, owner only)
     ═══════════════════════════════════════════════════ */
    public function destroy(int $id, Request $request): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);
        $user = $this->authUser($request);

        if ((int) $post->user_id !== (int) $user->id) {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        // Delete related images from storage
        foreach ($post->images as $img) {
            $storagePath = ltrim(str_replace('/storage/', '', parse_url($img->path, PHP_URL_PATH)), '/');
            Storage::disk('public')->delete($storagePath);
        }

        $post->delete();
        return response()->json(['message' => 'تم حذف البلاغ بنجاح']);
    }

    /* ═══════════════════════════════════════════════════
     |  POST /api/community/posts/{id}/accept
     |  Craftsman accepts / shows interest
     ═══════════════════════════════════════════════════ */
    public function accept(int $id, Request $request): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);
        $user = $this->authUser($request);

        if ((int) $post->user_id === (int) $user->id) {
            return response()->json(['message' => 'لا يمكنك قبول بلاغك الخاص'], 422);
        }

        if ($post->status !== 'open') {
            return response()->json(['message' => 'هذا البلاغ لم يعد متاحاً للقبول'], 422);
        }

        // Register interest (idempotent)
        CommunityPostInterest::firstOrCreate([
            'community_post_id' => $post->id,
            'user_id'           => $user->id,
        ]);

        // Assign first acceptor as executor
        if (is_null($post->acceptor_id)) {
            $post->update([
                'acceptor_id' => $user->id,
                'status'      => 'in_progress',
            ]);
        }

        $post->load(['user', 'acceptor', 'beforeImages', 'afterImages']);
        $post->loadCount(['interests', 'comments']);
        return response()->json(['data' => new CommunityPostResource($post)]);
    }

    /* ═══════════════════════════════════════════════════
     |  POST /api/community/posts/{id}/complete
     |  Craftsman submits after-photos to confirm work done
     ═══════════════════════════════════════════════════ */
    public function complete(int $id, Request $request): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);
        $user = $this->authUser($request);

        if ((int) $post->acceptor_id !== (int) $user->id) {
            return response()->json(['message' => 'فقط الصنايعي المعيّن يمكنه رفع صور الإنجاز'], 403);
        }

        if ($post->status !== 'in_progress') {
            return response()->json(['message' => 'البلاغ ليس في مرحلة التنفيذ حالياً'], 422);
        }

        $request->validate([
            'after_images'   => 'required|array|min:1|max:4',
            'after_images.*' => 'image|max:5120',
        ]);

        foreach ($request->file('after_images') as $image) {
            $path = $image->store('community/after', 'public');
            CommunityPostImage::create([
                'community_post_id' => $post->id,
                'path'              => Storage::url($path),
                'type'              => 'after',
            ]);
        }

        $post->update(['status' => 'completed']);
        $post->load(['user', 'acceptor', 'beforeImages', 'afterImages']);
        $post->loadCount(['interests', 'comments']);
        return response()->json(['data' => new CommunityPostResource($post)]);
    }

    /* ═══════════════════════════════════════════════════
     |  POST /api/community/posts/{id}/verify
     |  Poster confirms completion → points awarded
     ═══════════════════════════════════════════════════ */
    public function verify(int $id, Request $request): JsonResponse
    {
        $post = CommunityPost::findOrFail($id);
        $user = $this->authUser($request);

        if ((int) $post->user_id !== (int) $user->id) {
            return response()->json(['message' => 'فقط صاحب البلاغ يمكنه التحقق من الإنجاز'], 403);
        }

        if ($post->status !== 'completed') {
            return response()->json(['message' => 'البلاغ غير جاهز للتحقق بعد'], 422);
        }

        DB::beginTransaction();
        try {
            $post->update(['status' => 'verified']);

            if ($post->acceptor_id) {
                CommunityPoint::create([
                    'user_id'           => $post->acceptor_id,
                    'community_post_id' => $post->id,
                    'action'            => 'community_job_verified',
                    'points'            => $post->points_reward,
                ]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'حدث خطأ أثناء التحقق: ' . $e->getMessage()], 500);
        }

        $post->load(['user', 'acceptor', 'beforeImages', 'afterImages']);
        $post->loadCount(['interests', 'comments']);
        return response()->json(['data' => new CommunityPostResource($post)]);
    }

    /* ═══════════════════════════════════════════════════
     |  GET /api/community/posts/{id}/comments
     ═══════════════════════════════════════════════════ */
    public function comments(int $id): JsonResponse
    {
        $post     = CommunityPost::findOrFail($id);
        $comments = $post->comments()->with('user')->get();

        return response()->json([
            'data' => CommunityCommentResource::collection($comments),
        ]);
    }

    /* ═══════════════════════════════════════════════════
     |  POST /api/community/posts/{id}/comments
     ═══════════════════════════════════════════════════ */
    public function addComment(int $id, Request $request): JsonResponse
    {
        $request->validate(['body' => 'required|string|max:1000']);

        $user    = $this->authUser($request);
        $post    = CommunityPost::findOrFail($id);
        $comment = CommunityComment::create([
            'community_post_id' => $post->id,
            'user_id'           => $user->id,
            'body'              => $request->body,
        ]);
        $comment->load('user');

        return response()->json(['data' => new CommunityCommentResource($comment)], 201);
    }

    /* ═══════════════════════════════════════════════════
     |  GET /api/community/leaderboard
     |  Top 20 craftsmen by points (public)
     ═══════════════════════════════════════════════════ */
    public function leaderboard(): JsonResponse
    {
        $entries = DB::table('community_points')
            ->select('user_id', DB::raw('SUM(points) as total_points'), DB::raw('COUNT(*) as verified_jobs'))
            ->where('action', 'community_job_verified')
            ->groupBy('user_id')
            ->orderByDesc('total_points')
            ->limit(20)
            ->get();

        // Load users separately to avoid ambiguity with select()
        $userIds = $entries->pluck('user_id')->toArray();
        $users   = \App\Models\User::whereIn('id', $userIds)->get()->keyBy('id');

        $result = $entries->map(function ($entry, $idx) use ($users) {
            $pts  = (int) $entry->total_points;
            $user = $users[$entry->user_id] ?? null;

            $badge = match (true) {
                $pts >= 1000 => 'platinum',
                $pts >= 500  => 'gold',
                $pts >= 200  => 'silver',
                default      => 'bronze',
            };

            return [
                'rank'          => $idx + 1,
                'user'          => [
                    'id'     => $entry->user_id,
                    'name'   => $user?->name ?? 'مستخدم',
                    'avatar' => $user?->avatar ?? null,
                ],
                'total_points'  => $pts,
                'verified_jobs' => (int) $entry->verified_jobs,
                'badge'         => $badge,
            ];
        });

        return response()->json(['data' => $result]);
    }

    /* ═══════════════════════════════════════════════════
     |  GET /api/community/my-points
     |  Authenticated user's points history
     ═══════════════════════════════════════════════════ */
    public function myPoints(Request $request): JsonResponse
    {
        $user = $this->authUser($request);

        $totalPoints  = CommunityPoint::where('user_id', $user->id)->sum('points');
        $verifiedJobs = CommunityPoint::where('user_id', $user->id)
            ->where('action', 'community_job_verified')
            ->count();

        $badge = match (true) {
            $totalPoints >= 1000 => 'platinum',
            $totalPoints >= 500  => 'gold',
            $totalPoints >= 200  => 'silver',
            default              => 'bronze',
        };

        $history = CommunityPoint::where('user_id', $user->id)
            ->with('post:id,title')
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn($p) => [
                'id'         => $p->id,
                'action'     => $p->action === 'community_job_verified'
                    ? 'إنجاز خدمة مجتمعية'
                    : $p->action,
                'points'     => $p->points,
                'post_title' => $p->post?->title,
                'created_at' => $p->created_at->toISOString(),
            ]);

        return response()->json([
            'data' => [
                'total_points'   => (int) $totalPoints,
                'verified_jobs'  => $verifiedJobs,
                'badge'          => $badge,
                'history'        => $history,
                'next_draw_date' => now()->addMonthNoOverflow()->startOfMonth()->format('Y-m-d'),
                'draw_entries'   => (int) floor($totalPoints / 50),
            ],
        ]);
    }
}
