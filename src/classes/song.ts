export default interface Song {

	// basic info    
	name: string;
	artist: string;
	album: string;
	duration: number;
	url: string;
	id: string;

	//shared 
	albumImageUrl?: string;
	artistImageUrl?: string;
	generes?: string[];

	// youtube

	// spotify

	/** A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic. */
	acousticness: number;
	/** Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable. */
	danceability: number;
	/** The duration of the track in milliseconds. */
	duration_ms: number;
	/** Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. */
	energy: number;
	/** Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. */
	instrumentalness: number;
	/** The key the track is in. Integers map to pitches using standard Pitch Class notation. */
	key: number;
	/** Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. */
	liveness: number;
	/** The overall loudness of a track in decibels (dB). */
	loudness: number;
	/** Mode indicates the modality (major or minor) of a track, the type of scale from which its melodic content is derived. Major is represented by 1 and minor is 0. */
	mode: number;
	/** The popularity of the track. The value will be between 0 and 100, with 100 being the most popular. */
	popularity: number;
	/** Speechiness detects the presence of spoken words in a track. */
	speechiness: number;
	/** The overall estimated tempo of a track in beats per minute (BPM). */
	tempo: number;
	/** An estimated overall time signature of a track. */
	time_signature: number;
	/** A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. */
	valence: number;

}

export type SongData<Selection extends keyof Omit<Song, RequiredSongKeys>> = Pick<Song, Selection | RequiredSongKeys>;
export type RequiredSongKeys = 'name' | 'artist' | 'duration' | 'url' | 'id';
export type RequiredSongData = SongData<never>;