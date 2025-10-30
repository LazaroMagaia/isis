<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    protected $fillable = ['name', 'slug', 'description','is_active'];

}
