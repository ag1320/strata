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

function bggHeaders() {
  return {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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
