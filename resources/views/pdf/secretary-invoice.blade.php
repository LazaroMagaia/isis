<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Fatura #{{ $invoice->number }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 0 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tfoot td { font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .header { text-align: center; margin-top: 20px; }
        .info { margin-top: 10px; }
    </style>
</head>
<body>

    <!-- Nome da empresa -->
    <div class="header">
        <h1>Nome da Empresa</h1>
    </div>

    <!-- Informações da fatura -->
    <div class="info">
        <p><strong>Fatura #:</strong> {{ $invoice->number }}</p>
        <p><strong>Data de emissão:</strong> {{ $invoice->created_at->format('d/m/Y') }}</p>
        <p><strong>Destinatário:</strong> {{ $recipient }}</p>
        <p><strong>Secretária:</strong> {{ $invoice->secretary->name ?? '—' }}</p>
    </div>

    <!-- Tabela de itens -->
    <table>
        <thead>
            <tr>
                <th>Nome do Medicamento</th>
                @if($showBatch)
                <th>Número do Lote</th>
                @endif
                <th>Quantidade</th>
                <th>Preço Unitário (MT)</th>
                <th>Preço Total (MT)</th>
            </tr>

        </thead>
        <tbody>
            @foreach ($invoice->items as $item)
            <tr>
                <td>{{ $item->medicine->name ?? $item->prescription->medication ?? '—' }}</td>
                @if($showBatch)
                <td>{{ $item->batch->batch_number ?? '—' }}</td>
                @endif
                <td class="text-center">{{ $item->quantity }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 2, ',', '.') }} MT</td>
                <td class="text-right">{{ number_format($item->total_price, 2, ',', '.') }} MT</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="{{ $showBatch ? 4 : 3 }}" class="text-right">Total Fatura</td>
                <td class="text-right">{{ number_format($invoice->total_amount, 2, ',', '.') }} MT</td>
            </tr>
        </tfoot>

    </table>

    <footer style="margin-top: 30px; text-align: right; font-size: 10px; color: #555;">
        Impressão: {{ now()->format('d/m/Y') }}
    </footer>
</body>
</html>
