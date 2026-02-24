export type BannerType = 'public_website' | 'student_dashboard';
export type BannerAudience = 'all' | 'jee' | 'neet' | 'upsc' | 'foundation' | 'ssc' | 'banking';

export interface Banner {
    id: string;
    coaching_id: string;

    // Image & Content
    image_url: string;
    title: string | null;
    description: string | null;

    // Call to Action
    cta_text: string | null;
    cta_link: string | null;

    // Categorization
    type: BannerType;
    target_audience: BannerAudience;

    // Display Control
    display_order: number;
    is_active: boolean;

    // Scheduling
    start_date: string | null;
    end_date: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;
}
