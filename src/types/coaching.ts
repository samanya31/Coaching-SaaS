export interface Coaching {
    id: string;
    slug: string;
    name: string;
    domain: string | null;
    subdomain: string | null;

    // Branding
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    secondary_color: string;

    // Configuration
    template_id: string;
    features: Record<string, boolean>;
    settings: Record<string, any>;

    // Subscription
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    plan_limits: {
        max_students: number;
        max_teachers: number;
        max_courses?: number;
        max_storage_gb?: number;
    };
    subscription_status: 'active' | 'suspended' | 'cancelled';
    subscription_ends_at: string | null;

    // Metadata
    status: 'active' | 'suspended' | 'deleted';
    created_at: string;
    updated_at: string;
}
