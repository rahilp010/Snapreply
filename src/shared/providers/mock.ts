// src/shared/providers/mock.ts
import { GenerateRequest, GenerateResponse, TonePreset } from '../types';
import { isQuestionText } from '../prompts';

/**
 * High-quality contextual mock provider.
 * Allows the extension to work immediately out-of-the-box with zero API key configuration!
 */
export async function mockGenerate(req: GenerateRequest): Promise<GenerateResponse> {
  // Simulate natural AI latency (300ms - 600ms)
  await new Promise((resolve) => setTimeout(resolve, 400));

  const text = req.selectedText.trim();
  const intent = req.userIntent?.trim() || '';
  const tone: TonePreset = req.tone || 'friendly';
  const length = req.length || 'balanced';
  const action = req.action || 'reply';

  let result = '';

  // Handle specific actions
  switch (action) {
    case 'explain':
      result = generateExplanation(text, length);
      break;

    case 'summarize':
      result = generateSummary(text, length);
      break;

    case 'shorten':
      result = generateShortened(text);
      break;

    case 'translate':
      result = generateTranslation(text, req.language || 'English');
      break;

    case 'rewrite':
    case 'friendly':
    case 'professional':
      result = generateRewrite(text, action === 'friendly' ? 'friendly' : action === 'professional' ? 'professional' : tone, length);
      break;

    case 'reply':
    default:
      result = generateReply(text, intent, tone, length);
      break;
  }

  return {
    text: result,
    requestId: `mock_${Date.now()}`,
    tokensUsed: Math.round(result.length / 4),
    modelUsed: 'SnapReply Smart Assistant (Built-in Demo)',
  };
}

function generateReply(text: string, intent: string, tone: TonePreset, length: 'short' | 'balanced' | 'detailed'): string {
  const lower = text.toLowerCase().trim();
  const lowerIntent = intent.toLowerCase().trim();

  // Helper to cleanly clean intent sentences
  const cleanIntent = intent ? intent.replace(/^i want to /i, '').replace(/^please /i, '').trim() : '';

  // 1. Social Greetings & Personal Check-ins (e.g. "how's your day going so far", "how are you", "what's up")
  const isGreetingCheckIn =
    lower.includes("how's your day") ||
    lower.includes("how is your day") ||
    lower.includes("how are you") ||
    lower.includes("how's it going") ||
    lower.includes("how is it going") ||
    lower.includes("how have you been") ||
    lower.includes("how've you been") ||
    lower.includes("how was your day") ||
    lower.includes("how was your weekend") ||
    lower.includes("what's up") ||
    lower.includes("doing today") ||
    lower.includes("hope you're having a good") ||
    lower.includes("hope you are having a good");

  if (isGreetingCheckIn) {
    if (intent) {
      if (tone === 'casual') {
        return `Doing well, ${cleanIntent}! How about you, how's your day going?`;
      }
      if (tone === 'professional') {
        return `It's going well, thank you for asking. ${cleanIntent}. I hope you are having a productive day as well!`;
      }
      return `Going really well, thank you for asking! ${cleanIntent}. How is your day treating you?`;
    }

    if (tone === 'casual') {
      if (length === 'short') return `Pretty good so far! How about yours?`;
      if (length === 'detailed') return `Hey! Doing well so far, can't complain. Just working through a few things and keeping the momentum going. How has your week been treating you?`;
      return `Going good! Just knocking out a few things today. How's everything on your end?`;
    }

    if (tone === 'professional') {
      if (length === 'short') return `It's going well, thank you for checking in. I hope you are having a productive day as well.`;
      if (length === 'detailed') return `Thank you for inquiring. Things are progressing very well on today's priorities. I hope your day is going productively as well. Please let me know how I can assist you today.`;
      return `It's going well, thank you for checking in. Making steady progress on today's priorities. I hope everything is moving smoothly on your end as well.`;
    }

    if (tone === 'concise') {
      return `Doing well, thanks! Hope you are having a good one too.`;
    }

    if (tone === 'confident') {
      return `Going great, moving through priorities smoothly! Hope your day is just as productive.`;
    }

    if (tone === 'empathetic') {
      return `Going well, thank you so much for asking! I really appreciate the kind check-in. I hope you're having a calm and wonderful day too.`;
    }

    // Default: Friendly
    if (length === 'short') return `Going really well, thanks for asking! How about yours?`;
    if (length === 'detailed') return `It's going really well, thanks so much for asking! It's been a busy but very productive day on my end, getting through a few key priorities. I hope you're having a smooth and positive day as well. How are things on your side?`;
    return `It's going great so far, thanks for checking in! Staying productive and keeping things moving. How is your day treating you?`;
  }

  // 2. Availability & Scheduling Questions (e.g. "are you free tomorrow?", "can we hop on a call?")
  const isScheduling =
    lower.includes('free') ||
    lower.includes('available') ||
    lower.includes('can we meet') ||
    lower.includes('when can you') ||
    lower.includes('time for a call') ||
    lower.includes('jump on a call') ||
    lower.includes('quick chat') ||
    lower.includes('schedule') ||
    lower.includes('chat tomorrow') ||
    lower.includes('sync up');

  if (isScheduling) {
    if (lowerIntent.includes('yes') || lowerIntent.includes('sure') || lowerIntent.includes('accept')) {
      return tone === 'professional'
        ? `Yes, that time works well on my calendar. Please feel free to send over an invitation with the meeting link.`
        : `Yes, that time works great for me! I'll put it on my calendar. Looking forward to speaking!`;
    }
    if (lowerIntent.includes('no') || lowerIntent.includes('busy') || lowerIntent.includes('can\'t') || lowerIntent.includes('cant')) {
      return tone === 'professional'
        ? `Unfortunately, I have a prior commitment at that time. Would later this week work instead?`
        : `Things are a bit tight on my end at that time. Would another time or later this week work for you?`;
    }
    if (intent) {
      return `${cleanIntent}. Looking forward to connecting!`;
    }

    if (tone === 'professional') {
      return `Thank you for coordinating. That works well on my schedule. Please feel free to send over a calendar invitation with the meeting details.`;
    }
    if (tone === 'casual') {
      return `Yep, sounds good to me! Shoot over an invite whenever you're ready.`;
    }
    if (tone === 'concise') {
      return `That time works for me. Looking forward to it.`;
    }
    return `Yes, I should be free for that! Let me know what time works best on your calendar and I'll send over an invite.`;
  }

  // 3. Status & Progress Questions (e.g. "any update?", "how is the project going?")
  const isStatusInquiry =
    lower.includes('status') ||
    lower.includes('update') ||
    lower.includes('any progress') ||
    lower.includes('how is the project') ||
    lower.includes('did you finish') ||
    lower.includes('have you checked') ||
    lower.includes('where are we with');

  if (isStatusInquiry) {
    if (intent) {
      return `${cleanIntent}. I will keep you posted on any further updates!`;
    }
    if (tone === 'professional') {
      return `Thank you for checking in. Everything is progressing on schedule. I am finalizing the current deliverables and will share a comprehensive update shortly.`;
    }
    if (tone === 'casual') {
      return `Making solid progress! Just polishing up the last pieces and will share an update soon.`;
    }
    if (tone === 'concise') {
      return `On track. I'll share the finalized update shortly.`;
    }
    return `Hey! Thanks for following up. Things are coming along nicely and I'm currently reviewing the final details. I should have a full update ready for you shortly!`;
  }

  // 4. Opinions & Feedback Questions (e.g. "what do you think?", "thoughts?")
  const isFeedbackInquiry =
    lower.includes('what do you think') ||
    lower.includes('thoughts on') ||
    lower.includes('does this look good') ||
    lower.includes('your feedback') ||
    lower.includes('what\'s your take') ||
    lower.includes('how does this look');

  if (isFeedbackInquiry) {
    if (intent) {
      return `${cleanIntent}. Let me know if you want to discuss further!`;
    }
    if (tone === 'professional') {
      return `Thank you for sharing this for review. The overall structure and rationale are sound and well-aligned. I have noted a few minor refinements and will send them over shortly.`;
    }
    if (tone === 'casual') {
      return `Looks really solid to me! Super clean direction. Maybe just a few minor tweaks, but definitely heading the right way.`;
    }
    return `I took a look and it looks really promising! The overall direction is solid. I have a couple of small thoughts we could fine-tune, but overall it's in great shape.`;
  }

  // 5. General Questions (Factual / Informational inquiries)
  if (isQuestionText(text)) {
    if (intent) {
      return `${cleanIntent}. Please let me know if you need any more details on that!`;
    }
    if (tone === 'concise' || length === 'short') {
      return `The direct approach is to follow the standard specification and guidelines. Let me know if you need further details.`;
    }
    if (tone === 'professional') {
      return `In response to your inquiry: the standard recommended approach is to proceed according to the established framework to ensure full consistency and quality. Please let me know if you require further details.`;
    }
    if (tone === 'casual') {
      return `Basically, the best way to handle this is to keep it straightforward and follow the main guidelines. Let me know if you want to dig into anything specific!`;
    }
    return `Regarding your question: the most effective way to handle this is to focus on the key requirements and keep things aligned with the core goals. Let me know if you'd like me to dive deeper into any specific part!`;
  }

  // 6. General Non-Question Messages (Statements, updates, proposals)
  let intentSnippet = '';
  if (lowerIntent.includes('yes') || lowerIntent.includes('accept') || lowerIntent.includes('agree')) {
    intentSnippet = 'I would be delighted to proceed with this.';
  } else if (lowerIntent.includes('no') || lowerIntent.includes('decline') || lowerIntent.includes('pass')) {
    intentSnippet = 'Unfortunately, I will have to politely pass on this opportunity at the moment.';
  } else if (lowerIntent.includes('later') || lowerIntent.includes('reschedule') || lowerIntent.includes('busy')) {
    intentSnippet = 'Things are a bit tight on my end right now; could we reconnect early next week?';
  } else if (lowerIntent.includes('more info') || lowerIntent.includes('question') || lowerIntent.includes('details')) {
    intentSnippet = 'Could you share a bit more context or the latest details so I can review thoroughly?';
  } else if (intent) {
    intentSnippet = `${cleanIntent}.`;
  }

  if (tone === 'professional') {
    if (length === 'short') {
      return intentSnippet
        ? `Thank you for reaching out. ${intentSnippet} Looking forward to coordinating next steps.`
        : `Thank you for the update. I have reviewed the details and will follow up with our next steps shortly.`;
    }
    return `Dear colleague,\n\nThank you for getting in touch. ${intentSnippet || 'I appreciate you bringing this to my attention and providing clear context.'}\n\nPlease let me know if there are any additional materials I should review before we proceed.\n\nBest regards,`;
  }

  if (tone === 'concise') {
    return intentSnippet ? `Got it. ${intentSnippet}` : `Received and noted. Will circle back once reviewed.`;
  }

  if (tone === 'casual') {
    if (length === 'short') {
      return intentSnippet ? `Sounds great! ${intentSnippet}` : `Thanks for letting me know! All good on my side.`;
    }
    return `Hey! Thanks for pinging me on this. ${intentSnippet || 'Everything looks super clear to me.'} Let's catch up soon!`;
  }

  if (tone === 'confident') {
    return `Thank you for the note. ${intentSnippet || 'We are fully prepared to take this forward and deliver the expected results.'} Let's set up the schedule and execute.`;
  }

  if (tone === 'empathetic') {
    return `Thank you for sharing this with me. ${intentSnippet || 'I completely understand where you are coming from and appreciate you taking the time to share.'} Let me know how I can best support you.`;
  }

  // Default: Friendly
  if (lower.includes('meeting') || lower.includes('call') || lower.includes('zoom')) {
    if (intentSnippet) {
      return `Thanks for inviting me! ${intentSnippet} Looking forward to our discussion.`;
    }
    return length === 'short'
      ? `Thanks for the invite! That time works great for me. See you then!`
      : `Hi there!\n\nThanks so much for reaching out about this. That time works wonderfully on my calendar. I've added it and look forward to speaking soon!\n\nBest,`;
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) {
    return `Thank you for sending this over! ${intentSnippet || 'I will review the pricing breakdown carefully and reach back out with our thoughts.'} Talk soon!`;
  }

  if (length === 'short') {
    return intentSnippet
      ? `Thanks for your message! ${intentSnippet}`
      : `Thanks for following up! I've taken a look and will get right on it.`;
  }

  return `Hi there,\n\nThanks so much for reaching out! ${intentSnippet || "I really appreciate your note and I'm happy to help move this forward."}\n\nPlease feel free to reach out if anything else comes up in the meantime.\n\nWarm regards,`;
}

function generateRewrite(text: string, tone: TonePreset, length: 'short' | 'balanced' | 'detailed'): string {
  const clean = text.replace(/^(hey|hi|hello)[^,.]*[,.]/i, '').trim();
  if (tone === 'professional') {
    return length === 'short'
      ? `I hope you are having a productive week. Following up to see if there are any updates regarding this.`
      : `I hope this note finds you well. I am following up regarding ${clean ? `"${clean.length > 50 ? clean.substring(0, 50) + '...' : clean}"` : 'our ongoing priorities'} to see if you have any questions or if further details are needed.`;
  }
  if (tone === 'concise' || length === 'short') {
    return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : text;
  }
  if (tone === 'friendly') {
    return `Hey there! Just wanted to quickly touch base and see how things are moving along on your end. Let me know if you need anything from me!`;
  }
  if (tone === 'casual') {
    return `Hey! Just checking in real quick to see how things are going. Let me know whenever you have a second!`;
  }
  return text.trim();
}

function generateExplanation(_text: string, length: 'short' | 'balanced' | 'detailed'): string {
  if (length === 'short') {
    return `In plain terms: this message is primarily requesting your confirmation and clarifying next steps.`;
  }
  return `**Plain English Breakdown:**\n\n• **Core Message:** The sender is asking for your input on the highlighted matter.\n• **Key Takeaway:** No immediate urgency unless stated, but a thoughtful response is expected.\n• **Action Required:** Acknowledge receipt or indicate whether you agree with the proposal.`;
}

function generateSummary(text: string, _length: 'short' | 'balanced' | 'detailed'): string {
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (sentences.length <= 1) {
    return `**Summary:** ${text.trim()}`;
  }
  return `**Summary Points:**\n• ${sentences.slice(0, 3).join('\n• ')}`;
}

function generateShortened(text: string): string {
  const words = text.split(/\s+/);
  if (words.length <= 12) return text;
  return words.slice(0, 10).join(' ') + '... (concise summary)';
}

function generateTranslation(text: string, targetLanguage: string): string {
  const greetings: Record<string, string> = {
    Spanish: 'Hola, gracias por su mensaje. He recibido la información y responderé pronto.',
    French: 'Bonjour, merci pour votre message. J’ai bien reçu les détails et je reviens vers vous rapidement.',
    German: 'Hallo, vielen Dank für Ihre Nachricht. Ich habe die Details erhalten und melde mich in Kürze.',
    Japanese: 'こんにちは、メッセージをありがとうございます。詳細を確認の上、追ってご連絡いたします。',
    'Chinese (Simplified)': '您好，感谢您的来信。我已收到相关信息，稍后会尽快回复您。',
    Hindi: 'नमस्ते, आपके संदेश के लिए धन्यवाद। मुझे विवरण मिल गया है और मैं जल्द ही जवाब दूंगा।',
  };

  if (greetings[targetLanguage]) {
    return greetings[targetLanguage];
  }

  return `[${targetLanguage} Translation]: ${text}`;
}
