export type BannerType = 'public_website' | 'student_dashboard';
export type BannerAudience = string;

export interface Banner {
    id: string;
    coaching_id: string;

    // Image
    image_url: string;

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
