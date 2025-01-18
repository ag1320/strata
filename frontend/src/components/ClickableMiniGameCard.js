import MiniGameCard from "./MiniGameCard";

const ClickableMiniGameCard = ({ game, index, isDeletable}) => {
  return (
    <a
      href={game.url || ("https://boardgamegeek.com/boardgame/" + game?.$?.id?.toString())}
      target="_blank"
      rel="noopener noreferrer"
      className="bgg-link"
    >
      <MiniGameCard game={game} index={index} isDeletable={isDeletable} />
    </a>
  );
};

export default ClickableMiniGameCard;
