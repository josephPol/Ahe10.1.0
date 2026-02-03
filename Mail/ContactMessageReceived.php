<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\ContactMessage;

class ContactMessageReceived extends Mailable
{
    use Queueable, SerializesModels;

    public $messageModel;

    public function __construct(ContactMessage $message)
    {
        $this->messageModel = $message;
    }

    public function build()
    {
        $htmlPath = resource_path('emails/contact_received.html');
        $html = '';
        if (file_exists($htmlPath)) {
            $html = file_get_contents($htmlPath);
            $replacements = [
                '{{name}}' => $this->messageModel->name ?? '—',
                '{{email}}' => $this->messageModel->email,
                '{{subject}}' => $this->messageModel->subject ?? '—',
                '{{message}}' => nl2br(e($this->messageModel->message)),
                '{{created_at}}' => $this->messageModel->created_at,
            ];

            $html = str_replace(array_keys($replacements), array_values($replacements), $html);
        }

        return $this->subject('Nuevo mensaje de contacto')
                    ->html($html);
    }
}
