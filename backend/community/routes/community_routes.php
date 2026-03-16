<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CommunityController;

/*
|--------------------------------------------------------------------------
| Community Routes
| أضف هذه الأسطر داخل ملف routes/api.php
|--------------------------------------------------------------------------
*/

// ─── Public routes (no login required) ─────────────────────────────────
Route::prefix('community')->group(function () {
    Route::get('posts',               [CommunityController::class, 'index']);
    Route::get('posts/{id}',          [CommunityController::class, 'show']);
    Route::get('posts/{id}/comments', [CommunityController::class, 'comments']);
    Route::get('leaderboard',         [CommunityController::class, 'leaderboard']);
});

// ─── Authenticated routes (users + craftsmen + companies) ───────────────
// 'auth:sanctum,craftsman,company' يغطي كل أنواع المستخدمين في السيستم
Route::middleware('auth:sanctum,craftsman,company')->prefix('community')->group(function () {
    Route::post('posts',               [CommunityController::class, 'store']);
    Route::delete('posts/{id}',        [CommunityController::class, 'destroy']);
    Route::post('posts/{id}/accept',   [CommunityController::class, 'accept']);
    Route::post('posts/{id}/complete', [CommunityController::class, 'complete']);
    Route::post('posts/{id}/verify',   [CommunityController::class, 'verify']);
    Route::post('posts/{id}/comments', [CommunityController::class, 'addComment']);
    Route::get('my-points',            [CommunityController::class, 'myPoints']);
});
