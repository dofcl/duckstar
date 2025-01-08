import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'duckStarStatic',
    access: (allow) => ({
        'my-media/{entity_id}/*': [
            allow.guest.to(['read']),
            allow.entity('identity').to(['read', 'write', 'delete'])
        ],
        'images/*': [
            allow.authenticated.to(['read', 'write']),
            allow.guest.to(['read', 'write'])
        ],
        'music/*': [
            allow.authenticated.to(['read', 'write']),
            allow.guest.to(['read', 'write'])
        ],
        'videos/*': [
            allow.authenticated.to(['read', 'write']),
            allow.guest.to(['read', 'write'])
        ],
    })
});