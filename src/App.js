import React, { useEffect, useState } from "react";
import { InMemoryDatabase } from "brackets-memory-db";
import { BracketsManager } from "brackets-manager";

import "brackets-viewer/dist/brackets-viewer.min.css";
import "brackets-viewer/dist/brackets-viewer.min.js";
import "./styles.css";

const storage = new InMemoryDatabase();
const manager = new BracketsManager(storage);

const TournamentBracketsEditor = ({ type }) => {
  const [data, setData] = useState();

  const teams = 56;
  const size = 64; // 4 / 8 | 16 | 32 | 64 | 128
  const participants = Array(teams)
    .fill(0)
    .map((e, i) => `Team ${i + 1}`);

  const rerendering = async () => {
    const bracketsViewerNode = document.querySelector(".brackets-viewer");
    bracketsViewerNode?.replaceChildren();

    // window.bracketsViewer.onMatchClicked = async (match) => {
    window.bracketsViewer.onMatchClicked = async (match) => {
      console.log("A match was clicked", match);

      try {
        await manager.update.match({
          id: match.id,
          opponent1: { score: 5 },
          opponent2: { score: 7, result: "win" }
        });
        const tourneyData2 = await manager.get.currentMatches(0);
        const tourneyData = await manager.get.stageData(0);
        setData(tourneyData);
        console.log("A tourney", tourneyData2);
      } catch (error) {}
    };

    if (data && data.participant !== null) {
      // This is optional. You must do it before render().
      window.bracketsViewer.setParticipantImages(
        data.participant.map((participant) => ({
          participantId: participant.id || 1,
          imageUrl: "https://github.githubassets.com/pinned-octocat.svg"
        }))
      );

      window.bracketsViewer.render(
        {
          stages: data.stage,
          matches: data.match,
          matchGames: data.match_game,
          participants: data.participant
        },
        {
          customRoundName: (info, t) => {
            // You have a reference to `t` in order to translate things.
            // Returning `undefined` will fallback to the default round name in the current language.
            if (info.fractionOfFinal === 1 / 2) {
              if (info.groupType === "single-bracket") {
                // Single elimination
                return "Semi Finals";
              } else {
                // Double elimination
                return `${t(`abbreviations.${info.groupType}`)} ESemi Finals`;
              }
            }
            if (info.fractionOfFinal === 1 / 4) {
              return "Quarter Finals";
            }

            if (info.finalType === "grand-final") {
              if (info.roundCount > 1) {
                return `${t(`abbreviations.${info.finalType}`)} Final Round ${
                  info.roundNumber
                }`;
              }
              return `Grand Final`;
            }
          },
          participantOriginPlacement: "before",
          separatedChildCountLabel: true,
          showSlotsOrigin: true,
          showLowerBracketSlotsOrigin: true,
          highlightParticipantOnHover: true
        }
      );
    }
    console.log(data);
  };

  const rendering = async () => {
    await manager.create({
      name: "Tournament Brackets",
      tournamentId: 0,
      // type,
      // type: 'round_robin',
      type: "single_elimination",
      seeding: participants,
      settings: {
        seedOrdering: ["inner_outer"],
        balanceByes: false,
        size: size,
        matchesChildCount: 0,
        consolationFinal: false
      }
    });
    const tournamentData = await manager.get.stageData(0);
    setData(tournamentData);
  };

  useEffect(() => {
    rendering();
  }, []);

  useEffect(() => {
    rerendering();
  }, [data]);

  return (
    <div className="TournamentBracketsEditor">
      <div className="brackets-viewer"></div>
    </div>
  );
};

export default TournamentBracketsEditor;
