import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users with their profiles (for email)
    const { data: users } = await supabase.auth.admin.listUsers();

    if (!users?.users) {
      return new Response(JSON.stringify({ message: "No users found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const hour = now.getUTCHours() - 3; // BRT (UTC-3)

    // Determine period
    let period = "";
    if (hour >= 7 && hour < 12) period = "manhã";
    else if (hour >= 12 && hour < 18) period = "tarde";
    else if (hour >= 18 && hour < 23) period = "noite";
    else {
      return new Response(JSON.stringify({ message: "Outside notification hours" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tips = [
      "📚 Você já estudou educação financeira hoje? Acesse a seção Educação no app!",
      "💡 Dica rápida: CDB com liquidez diária rende mais que a poupança!",
      "🎯 Que tal revisar suas metas financeiras agora?",
      "📊 Você sabia que investir R$ 50/mês pode fazer diferença em 5 anos?",
      "🛡️ Já verificou sua reserva de emergência hoje?",
      "💰 Lembrete: Conhecimento financeiro é o melhor investimento!",
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];

    let sent = 0;
    for (const user of users.users) {
      if (!user.email) continue;

      // Send email via Supabase (uses built-in email)
      // Note: In production, use a proper email service like Resend
      const { error } = await supabase.auth.admin.inviteUserByEmail(user.email, {
        data: { notification_only: true },
        redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/educacao`,
      });

      // For now, log the notification attempt
      console.log(`Notification for ${user.email}: ${tip} (${period})`);
      sent++;
    }

    return new Response(JSON.stringify({ message: `${sent} notifications processed`, period, tip }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
