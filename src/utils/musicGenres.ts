interface Genre {
    label: string;
    value: string;
}

export const genres: Genre[] = [
    { label: 'African', value: 'african' },
    { label: 'Alternative', value: 'alternative' },
    { label: 'Bachata', value: 'bachata' },
    { label: 'Blues', value: 'blues' },
    { label: 'Bollywood', value: 'bollywood' },
    { label: 'Classical', value: 'classical' },
    { label: 'Country', value: 'country' },
    { label: 'Dubstep', value: 'dubstep' },
    { label: 'Folk', value: 'folk' },
    { label: 'Gospel', value: 'gospel' },
    { label: 'Grunge', value: 'grunge' },
    { label: 'Hip Hop', value: 'hiphop' },
    { label: 'House', value: 'house' },
    { label: 'Indie', value: 'indie' },
    { label: 'J-Pop', value: 'jpop' },
    { label: 'Jazz', value: 'jazz' },
    { label: 'K-Pop', value: 'kpop' },
    { label: 'Latin', value: 'latin' },
    { label: 'Merengue', value: 'merengue' },
    { label: 'Metal', value: 'metal' },
    { label: 'Pop', value: 'pop' },
    { label: 'Punk', value: 'punk' },
    { label: 'R&B', value: 'rnb' },
    { label: 'Rap', value: 'rap' },
    { label: 'Reggae', value: 'reggae' },
    { label: 'Reggaeton', value: 'reggaeton' },
    { label: 'Rock', value: 'rock' },
    { label: 'Salsa', value: 'salsa' },
    { label: 'Techno', value: 'techno' },
    { label: 'Trance', value: 'trance' }
];

// You can also export the interface if you need it elsewhere
export type { Genre };
