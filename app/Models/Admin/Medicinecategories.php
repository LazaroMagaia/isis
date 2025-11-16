<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class Medicinecategories extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];
}
