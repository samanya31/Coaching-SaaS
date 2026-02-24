export interface Lead {
    id: string;
    coaching_id: string;
    name: string;
    phone: string;
    email?: string;
    course_interest?: string;
    language_preference?: string;
    status: 'new' | 'contacted' | 'converted' | 'archived';
    source?: string;
    created_at: string;
    updated_at: string;
}
