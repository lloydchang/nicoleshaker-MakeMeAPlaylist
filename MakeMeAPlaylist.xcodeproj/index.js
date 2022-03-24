<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.XIB" version="3.0" toolsVersion="13142" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES">
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="12042"/>
    </dependencies>
    <objects>
        <placeholder placeholderIdentifier="IBFilesOwner" id="-1" userLabel="File's Owner"/>
        <placeholder placeholderIdentifier="IBFirstResponder" id="-2" customClass="UIResponder"/>
    </objects>
</document>

//https://developer.spotify.com/console/get-recommendations/
//playlist-modify-private
const SPOTIFY_TOKEN =
  "BQBiefmS4gP3SFaGV-gv5RqEKYwuAFdpaManK2CPTHhn1vKS8TCNfzBkfKjtFE4vE31BTKRvq2OiEl791Xa-bM8kNbVac1qUjo7cR1lLVivr1WtAs2t0XOS_S5mQTCD988q5iY7pq6YFiKbqowHonwnFdHexDzI8nS9q058UUZ01i77Cl3po2yx6O5Kv3So";
const SPOTIFY_USER_ID = "madeyw0ezc5bnvzdbun1vycrh";

const baseSpotifyRequestObj = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${SPOTIFY_TOKEN}`,
    },
  };
 
  const dom = {
    generateForm: document.getElementById("generate-form"),
    genresInput: document.getElementById("genres"),
    genresInput2: document.getElementById("genres2"),
    artistsInput: document.getElementById("artists"),
    tracksInput: document.getElementById("tracks"),
    playlistEmbedWrapper: document.getElementById("playlist-embed-wrapper"),
  };
 
  const getArtistId = async (artistName) => {
    const artistSearchURL = new URL("https://api.spotify.com/v1/search");
    artistSearchURL.searchParams.set("type", "artist");
    artistSearchURL.searchParams.set("limit", "1");
    artistSearchURL.searchParams.set("q", artistName);
 
    const artistRes = await fetch(
      artistSearchURL.toString(),
      baseSpotifyRequestObj
    );
    const artistsSearchData = await artistRes.json();
    return artistsSearchData.artists.items[0].id;
  };
 
  const getTrackId = async (trackName) => {
    const trackSearchURL = new URL("https://api.spotify.com/v1/search");
    trackSearchURL.searchParams.set("type", "track");
    trackSearchURL.searchParams.set("limit", "1");
    trackSearchURL.searchParams.set("q", trackName);
 
    const trackRes = await fetch(
      trackSearchURL.toString(),
      baseSpotifyRequestObj
    );
    const tracksSearchData = await trackRes.json();
    return tracksSearchData.tracks.items[0].id;
  };
 
  const getRecommendations = async (market, genres, artist, track) => {
    const recommendationURL = new URL(
      "https://api.spotify.com/v1/recommendations"
    );
 
    recommendationURL.searchParams.set("market", market);
    recommendationURL.searchParams.set("seed_genres", genres);
    recommendationURL.searchParams.set("seed_artists", artist);
    recommendationURL.searchParams.set("seed_tracks", track);
 
    const res = await fetch(recommendationURL.toString(), baseSpotifyRequestObj);
    return await res.json();
  };
 
  const createPlaylist = async (userId, playlistName, playlistDescription) => {
    const createPlaylistURL = new URL(
      `https://api.spotify.com/v1/users/${userId}/playlists`
    );
 
    const res = await fetch(createPlaylistURL.toString(), {
      ...baseSpotifyRequestObj,
      method: "POST",
      body: JSON.stringify({
        name: playlistName,
        description: playlistDescription,
        public: false,
      }),
    });
 
    return await res.json();
  };
 
  const addTracksToPlaylist = async (playlistId, trackIds) => {
    const updatePlaylistURL = new URL(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
    );
 
    const addRes = await fetch(updatePlaylistURL.toString(), {
      ...baseSpotifyRequestObj,
      method: "POST",
      body: JSON.stringify({ uris: trackIds }),
    });
 
    return await addRes.json();
  };
 
  const embedPlaylistIntoPage = (playlistId) => {
    dom.playlistEmbedWrapper.innerHTML = `
    <iframe src="https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator" width="100%" height="380" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
    `;
  };
 
  dom.generateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
 
    const artistId = await getArtistId(dom.artistsInput.value);
    const trackId = await getTrackId(dom.tracksInput.value);
 
    const recommendations = await getRecommendations(
      "US",
      `${dom.genresInput.value},${dom.genresInput2.value}`,
      artistId,
      trackId
    );
 
    const tracks = [];
    recommendations.tracks.forEach((t, count) => {
      tracks.push(t.uri);
      console.log(`${count + 1}) ${t.name} by ${t.artists[0].name}`);
    });
 
    const createPlaylistData = await createPlaylist(
      SPOTIFY_USER_ID,
      `Songs similar to ${dom.tracksInput.value}`,
      `Playlist generated by the software created by Bruna Ávila on ${new Date().toLocaleString()}`
    );
 
    await addTracksToPlaylist(createPlaylistData.id, tracks);
 
    embedPlaylistIntoPage(createPlaylistData.id);
  });
