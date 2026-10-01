import { useEffect, useContext } from "react";
import { AppContext } from "../../AppContext";
import { getWishlist } from "../../helper-functions/serverCalls";

const GetWishlist = () => {
  const { setWishlist, wishlistRefresh } = useContext(AppContext);

  useEffect(() => {
    getWishlist().then((data) => {
      setWishlist(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistRefresh]);

  return null;
};

export default GetWishlist;
