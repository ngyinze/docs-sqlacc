import React, { useState, useEffect } from 'react';
import styles from "@src-sqlacc/css/yt-playlist.module.css";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function YouTubePlaylist({ playlistId }) {
  const { siteConfig } = useDocusaurusContext();
  const apiKey = siteConfig.customFields?.youtubeApiKey;
  const [playlistItems, setPlaylistItems] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch playlist data');
        }
        
        const data = await response.json();
        setPlaylistItems(data.items || []);
        
        if (data.items && data.items.length > 0) {
          setSelectedVideo(data.items[0].snippet.resourceId.videoId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (playlistId && apiKey) {
      fetchPlaylistData();
    } else {
      setError('Playlist ID and API Key are required');
      setLoading(false);
    }
  }, [playlistId, apiKey]);

  const selectVideo = (videoId) => {
    setSelectedVideo(videoId);
  };

  // Helper function to safely get thumbnail URL
  const getThumbnailUrl = (thumbnails) => {
    if (!thumbnails) return null;
    
    // Try to get thumbnails in order of preference
    if (thumbnails.default?.url) return thumbnails.default.url;
    if (thumbnails.medium?.url) return thumbnails.medium.url;
    if (thumbnails.high?.url) return thumbnails.high.url;
    if (thumbnails.standard?.url) return thumbnails.standard.url;
    if (thumbnails.maxres?.url) return thumbnails.maxres.url;
    
    // If we have thumbnails object but none of the expected formats,
    // find the first URL property
    const firstThumbnail = Object.values(thumbnails).find(thumb => thumb?.url);
    if (firstThumbnail?.url) return firstThumbnail.url;
    
    return 'https://placehold.co/600x400';
  };

  if (loading) return <div className={styles.loading}>Loading playlist...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.playlistContainer}>
      <div className={styles.videoPlayer}>
        {selectedVideo && (
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideo}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.videoIframe}
          ></iframe>
        )}
      </div>
      
      <div className={styles.playlistItems}>
        <h3>Playlist Videos</h3>
        <ul className={styles.videoList}>
          {playlistItems.map((item) => (
            <li 
              key={item.id}
              className={`${styles.videoItem} ${selectedVideo === item.snippet.resourceId.videoId ? styles.selectedVideo : ''}`}
              onClick={() => selectVideo(item.snippet.resourceId.videoId)}
            >
              <div className={styles.thumbnailContainer}>
                <img 
                  src={getThumbnailUrl(item.snippet.thumbnails)}
                  alt={item.snippet.title || 'Video thumbnail'}
                  className={styles.thumbnail}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/120x68?text=Error';
                  }}
                />
              </div>
              <div className={styles.videoInfo}>
                <div className={styles.videoTitle}>{item.snippet.title || 'Untitled video'}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  
}