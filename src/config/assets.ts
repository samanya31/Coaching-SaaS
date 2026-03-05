/**
 * Central UI Asset URLs — served from Supabase Storage (ui-assets bucket).
 *
 * To update an image: just re-upload the file with the same name in the
 * Supabase dashboard → Storage → ui-assets. The app picks it up automatically.
 * No rebuild required for web. Android will fetch the new image on next launch.
 *
 * If you rename a file, update the matching constant below.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const BUCKET = 'ui-assets';
const BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

export const ASSETS = {
    /** Batch listing page header background */
    batchBg: `${BASE}/batch.png`,

    /** Courses page header background */
    coursesBg: `${BASE}/courses.png`,

    /** Live classes page header background */
    liveBg: `${BASE}/live.png`,

    /** Student portal illustration — desktop */
    studentPortal: `${BASE}/student_portal.png`,

    /** Student portal illustration — mobile/tablet */
    studentPortalRes: `${BASE}/student_portal_res.png`,

    /** Admin portal illustration — desktop */
    adminPortal: `${BASE}/admin_portal.png`,

    /** Admin portal illustration — mobile/tablet */
    adminPortalRes: `${BASE}/admin_portal_res.png`,

    /** Vidya Yantra app logo */
    appLogo: `${BASE}/app_img.png`,

    /** Student page hero dashboard background */
    dashboardBg: `${BASE}/dashboard-bg.png`,

    /** Default student avatar fallback */
    studentAvatar: `${BASE}/student-avatar.png`,
} as const;
