import { NextRequest, NextResponse } from "next/server";
import { AutomatedMessagingSystem } from "@/lib/automated-messaging";

// Global instance (in production, use a proper database)
let messagingSystem: AutomatedMessagingSystem | null = null;

function getMessagingSystem(): AutomatedMessagingSystem {
  if (!process.env.BOT_TOKEN) {
    throw new Error('Bot token not configured');
  }
  
  if (!messagingSystem) {
    messagingSystem = new AutomatedMessagingSystem(process.env.BOT_TOKEN);
    messagingSystem.createDefaultTemplates();
  }
  
  return messagingSystem;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const system = getMessagingSystem();

    switch (action) {
      case 'templates':
        const templates = system.getTemplates();
        return NextResponse.json({ success: true, data: templates });

      case 'scheduled':
        const scheduled = system.getScheduledMessages();
        return NextResponse.json({ success: true, data: scheduled });

      case 'active':
        const active = system.getActiveScheduledMessages();
        return NextResponse.json({ success: true, data: active });

      default:
        return NextResponse.json({
          success: true,
          message: 'Automated messaging API',
          availableActions: [
            'templates - Get all message templates',
            'scheduled - Get all scheduled messages',
            'active - Get active scheduled messages'
          ]
        });
    }

  } catch (error) {
    console.error('Automated messaging GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    const system = getMessagingSystem();

    switch (action) {
      case 'send-message':
        const { chatId, templateId, variables = {} } = data;
        
        if (!chatId || !templateId) {
          return NextResponse.json(
            { error: 'chatId and templateId are required' },
            { status: 400 }
          );
        }

        const result = await system.sendMessage(chatId, templateId, variables);
        return NextResponse.json({ success: true, data: result });

      case 'send-to-multiple':
        const { chatIds, templateId: multiTemplateId, variables: multiVariables = {} } = data;
        
        if (!chatIds || !Array.isArray(chatIds) || !multiTemplateId) {
          return NextResponse.json(
            { error: 'chatIds (array) and templateId are required' },
            { status: 400 }
          );
        }

        const results = await system.sendToMultipleChats(chatIds, multiTemplateId, multiVariables);
        return NextResponse.json({ success: true, data: results });

      case 'schedule-message':
        const { 
          id, 
          chatId: scheduleChatId, 
          templateId: scheduleTemplateId, 
          scheduledFor, 
          variables: scheduleVariables = {} 
        } = data;
        
        if (!id || !scheduleChatId || !scheduleTemplateId || !scheduledFor) {
          return NextResponse.json(
            { error: 'id, chatId, templateId, and scheduledFor are required' },
            { status: 400 }
          );
        }

        system.createScheduledMessage(
          id,
          scheduleChatId,
          scheduleTemplateId,
          new Date(scheduledFor),
          scheduleVariables
        );

        return NextResponse.json({ success: true, message: 'Message scheduled successfully' });

      case 'schedule-recurring':
        const { 
          id: recurringId, 
          chatId: recurringChatId, 
          templateId: recurringTemplateId, 
          intervalMs, 
          variables: recurringVariables = {} 
        } = data;
        
        if (!recurringId || !recurringChatId || !recurringTemplateId || !intervalMs) {
          return NextResponse.json(
            { error: 'id, chatId, templateId, and intervalMs are required' },
            { status: 400 }
          );
        }

        system.createRecurringMessage(
          recurringId,
          recurringChatId,
          recurringTemplateId,
          intervalMs,
          recurringVariables
        );

        return NextResponse.json({ success: true, message: 'Recurring message created successfully' });

      case 'cancel-scheduled':
        const { id: cancelId } = data;
        
        if (!cancelId) {
          return NextResponse.json(
            { error: 'id is required' },
            { status: 400 }
          );
        }

        system.cancelScheduledMessage(cancelId);
        return NextResponse.json({ success: true, message: 'Scheduled message cancelled' });

      case 'add-template':
        const { template } = data;
        
        if (!template || !template.id || !template.name || !template.content) {
          return NextResponse.json(
            { error: 'template with id, name, and content is required' },
            { status: 400 }
          );
        }

        system.addTemplate(template);
        return NextResponse.json({ success: true, message: 'Template added successfully' });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Automated messaging POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
