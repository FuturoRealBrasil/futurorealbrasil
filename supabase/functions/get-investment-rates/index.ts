import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch current Selic annual rate from BCB API (series 432 - Selic Meta)
    const selicRes = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"
    );
    const selicData = await selicRes.json();
    const selicAnnual = selicData?.[0]?.valor ? parseFloat(selicData[0].valor) / 100 : 0.1075;

    // CDI is typically very close to Selic (within 0.1pp)
    const cdiAnnual = selicAnnual - 0.001; // CDI ~= Selic - 0.10pp

    // Calculate rates for each investment type
    const rates = {
      selic: selicAnnual,
      cdi: cdiAnnual,
      cdb_100: cdiAnnual,                    // CDB 100% CDI
      cdb_120: cdiAnnual * 1.2,              // CDB 120% CDI
      tesouro_selic: selicAnnual,             // Tesouro Selic ≈ Selic
      lci_90: cdiAnnual * 0.9,               // LCI 90% CDI
      lca_90: cdiAnnual * 0.9,               // LCA 90% CDI
      tesouro_ipca: 0.06 + 0.045,            // IPCA+ ~6% + IPCA estimado ~4.5%
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Fallback rates if API fails
    const fallback = {
      selic: 0.1075,
      cdi: 0.1065,
      cdb_100: 0.1065,
      cdb_120: 0.1278,
      tesouro_selic: 0.1075,
      lci_90: 0.09585,
      lca_90: 0.09585,
      tesouro_ipca: 0.105,
      updated_at: new Date().toISOString(),
      fallback: true,
    };

    return new Response(JSON.stringify(fallback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
