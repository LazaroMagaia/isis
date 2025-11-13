@component('mail::message')
# Olá, {{ $user->name }} 👋

Sua conta foi criada com sucesso no sistema da isis.

**Detalhes de acesso:**
- Email: {{ $user->email }}
- Senha provisória: **{{ $temporaryPassword }}**

Por favor, altere sua senha assim que fizer login.

@component('mail::button', ['url' => config('app.url')])
Acessar o sistema
@endcomponent

Obrigado,  
{{ config('app.name') }}
@endcomponent
