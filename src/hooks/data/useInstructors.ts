import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/api/user.service';
import { useTenant } from '@/app/providers/TenantProvider';
import { userKeys } from './useUsers';

export function useInstructors() {
    const { coachingId } = useTenant();

    return useQuery({
        queryKey: userKeys.byRole(coachingId!, 'teacher'),
        queryFn: async () => {
            const users = await userService.getUsers(coachingId!, 'teacher');
            // Map users to Instructor format if needed, or just return users
            // For now, returning users as they contain the necessary profile info
            return users.map(user => ({
                id: user.id,
                name: user.full_name,
                email: user.email,
                subject: user.specialization || 'General', // customized field
                phone: user.phone || 'N/A',
                avatar: user.avatar_url,
                rating: 4.8, // Placeholder as DB might not have ratings yet
                totalClasses: 0, // Placeholder
                status: user.status,
                experience: 5, // Placeholder
                bio: 'Experienced educator passionate about teaching.'
            }));
        },
        enabled: !!coachingId,
    });
}
