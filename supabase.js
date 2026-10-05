// Supabase integration for ThermalCamera
// Uses the public Publishable key. Never put a service_role/secret key in this file.

const SUPABASE_URL = 'https://spboyylbuftzzpfkyhsy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZnBzx2f0CgQEezfFj8L0OA_HIPuIPij';
const SUPABASE_BUCKET = 'ThermalMedia';

async function uploadThermalPhotoToSupabase(dataUrl) {
    try {
        if (!dataUrl || !dataUrl.startsWith('data:image/')) return false;

        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileName = `photos/photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

        const uploadResponse = await fetch(
            `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_BUCKET)}/${fileName}`,
            {
                method: 'POST',
                headers: {
                    apikey: SUPABASE_PUBLISHABLE_KEY,
                    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                    'Content-Type': 'image/jpeg',
                    'x-upsert': 'false'
                },
                body: blob
            }
        );

        if (!uploadResponse.ok) {
            console.error('Supabase photo upload failed:', await uploadResponse.text());
            return false;
        }

        const recordResponse = await fetch(`${SUPABASE_URL}/rest/v1/thermal_media`, {
            method: 'POST',
            headers: {
                apikey: SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal'
            },
            body: JSON.stringify({
                file_path: fileName,
                media_type: 'photo'
            })
        });

        if (!recordResponse.ok) {
            console.error('Supabase database record failed:', await recordResponse.text());
            return false;
        }

        console.log('ThermalCamera photo uploaded to Supabase:', fileName);
        return true;
    } catch (error) {
        console.error('Supabase upload error:', error);
        return false;
    }
}

window.uploadThermalPhotoToSupabase = uploadThermalPhotoToSupabase;
