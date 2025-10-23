import React from 'react';

interface VideoPlayerProps {
    videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
    return (
        <div className="w-full h-full p-2 bg-black rounded-lg">
            <video
                key={videoUrl}
                className="rounded-md shadow-lg w-full h-full object-contain"
                controls
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
