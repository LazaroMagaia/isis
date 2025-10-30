<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable =[
        'name','description','price','duration_minutes','requires_approval','is_active','category_id'
    ];

    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

}
