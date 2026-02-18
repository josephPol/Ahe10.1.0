<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_premium')->default(false)->after('rating');
            $table->timestamp('premium_since')->nullable()->after('is_premium');
            $table->string('premium_plan', 50)->nullable()->after('premium_since');
            $table->decimal('premium_price', 8, 2)->nullable()->after('premium_plan');
            $table->string('premium_payment_method', 30)->nullable()->after('premium_price');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_premium',
                'premium_since',
                'premium_plan',
                'premium_price',
                'premium_payment_method'
            ]);
        });
    }
};
