const axios = require("axios").default;
const xml2js = require("xml2js");

const parser = new xml2js.Parser();

// Server-to-server call - CORS is a browser-only restriction and never
// applied here, so this talks to BGG directly (no cors-anywhere proxy).
// Must be the bare host, not www: BGG 301-redirects www -> bare host, and
// BGG's XML API has required an Authorization: Bearer <token> header since
// 2025 (see BACKEND_RESTRUCTURE.md) - the old www URL plus the redirect was
// the real source of confusing 401s, not a CORS problem.
const BGG_BASE_URL = "https://boardgamegeek.com/xmlapi2";

// No spoofed User-Agent here on purpose - confirmed with a controlled A/B
// test (2026-10-01, see BACKEND_RESTRUCTURE.md) that a fake "Chrome on
// Windows" UA is exactly what triggers Cloudflare's bot challenge on this
// endpoint: identical request, only the UA header differed, and the
// spoofed one got a 403 "Just a moment..." challenge while axios's own
// honest default UA got a clean 200. Node's TLS handshake doesn't match a
// real Chrome's, so claiming to be Chrome anyway is a bot-detection red
// flag, not camouflage.
function bggHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${process.env.BGG_API_KEY}`,
    },
  };
}

function parseXml(xml) {
  return new Promise((resolve, reject) => {
    parser.parseString(xml, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

// hot-games and specific-games always come back 200 with XML immediately.
async function fetchBggXml(url) {
  const response = await axios.get(url, bggHeaders());
  return parseXml(response.data);
}

// user-games, user-wishlist, and friends can come back 202 while BGG builds
// the collection async - callers get { pending: true } and the caller's
// route decides what to send back (originally "Waiting for response").
async function fetchBggXmlWithPending(url) {
  const response = await axios.get(url, bggHeaders());
  if (response.status === 202) {
    return { pending: true };
  }
  if (response.status === 200) {
    return { pending: false, data: await parseXml(response.data) };
  }
  throw new Error(`Unexpected status code from BGG: ${response.status}`);
}

function getHotGames() {
  return fetchBggXml(`${BGG_BASE_URL}/hot?boardgame`);
}

function getSpecificGames(gameIds) {
  return fetchBggXml(`${BGG_BASE_URL}/thing?id=${gameIds.join(",")}`);
}

function getUserGames(username) {
  return fetchBggXmlWithPending(
    `${BGG_BASE_URL}/collection?username=${username}&subtype=boardgame&own=1`
  );
}

function getUserWishlist(username) {
  return fetchBggXmlWithPending(
    `${BGG_BASE_URL}/collection?username=${username}&wishlist=1&subtype=boardgame`
  );
}

function getFriends(username) {
  return fetchBggXmlWithPending(
    `${BGG_BASE_URL}/user?name=${username}&buddies=1`
  );
}

module.exports = {
  getHotGames,
  getSpecificGames,
  getUserGames,
  getUserWishlist,
  getFriends,
};
