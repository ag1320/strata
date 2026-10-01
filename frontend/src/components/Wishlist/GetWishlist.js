import { useEffect, useContext } from "react";
import { AppContext } from "../../AppContext";
import { getWishlist } from "../../helper-functions/serverCalls";

const GetWishlist = () => {
  const { setWishlist, wishlistRefresh, setWishlistError } = useContext(AppContext);

  useEffect(() => {
    setWishlistError(null);
    getWishlist()
      .then((data) => {
        setWishlist(data);
      })
      .catch((err) => {
        console.log(err);
        setWishlist([]);
        setWishlistError(
          "Couldn't load your wishlist from BGG - try refreshing."
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistRefresh]);

  return null;
};

export default GetWishlist;
