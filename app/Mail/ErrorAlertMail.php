<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ErrorAlertMail extends Mailable
{
    public function __construct(public string $title, public string $body)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->title);
    }

    public function content(): Content
    {
        return new Content(htmlString: '<pre style="font:13px/1.5 ui-monospace,Menlo,monospace;white-space:pre-wrap">' . e($this->body) . '</pre>');
    }
}
