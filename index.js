import { Chess } from "chess.js";
import { arrayToTree } from "performant-array-to-tree";
import _ from "lodash";

class chessjsextended {
  constructor(a_fen) {
    this.chess = new Chess(a_fen);
    this._rHistory = {
      realHistory: [],
      realHistoryIdIndex: 0,
      realHistoryIdIndexBranch: null,
    };
  }

  playMove(a_move) {
    let temp_retour = this.chess.move(a_move);
    // move is valid ?
    if (temp_retour) {
      let temp_pointer = _.findIndex(this._rHistory.realHistory, {
        parentId: this._rHistory.realHistoryIdIndexBranch,
        move: temp_retour.san,
      });
      // is this move already in rHistory ?
      if (temp_pointer !== -1) {
        console.log("Avoid a move who already exists !");
        this._rHistory.realHistoryIdIndexBranch =
          this._rHistory.realHistory[temp_pointer].id;
      } else {
        let temp_json = {
          id: ++this._rHistory.realHistoryIdIndex,
          parentId: this._rHistory.realHistoryIdIndexBranch,
          move: temp_retour.san,
        };
        this._rHistory.realHistory.push(temp_json);
        this._rHistory.realHistoryIdIndexBranch =
          this._rHistory.realHistoryIdIndex;
      }
    }
    return temp_retour;
  }

  goPly(a_ply) {
    for (let i = this.chess.history().length; i > a_ply; i--) {
      this.chess.undo();
      //
      let temp_pointer = _.findIndex(this._rHistory.realHistory, {
        id: this._rHistory.realHistoryIdIndexBranch,
      });
      if (temp_pointer === 0) {
        console.log("Warning back to the root !");
        this._rHistory.realHistoryIdIndexBranch = null;
      } else {
        this._rHistory.realHistoryIdIndexBranch =
          this._rHistory.realHistory[temp_pointer].parentId;
      }
      console.log("Back to : " + this._rHistory.realHistoryIdIndexBranch);
      //
    }
  }

  displayRealHistory() {
    return arrayToTree(this._rHistory.realHistory, {
      dataField: null,
    });
  }

  // getters and letters

  get realHistory() {
    return this._rHistory.realHistory;
  }
}

let game = new chessjsextended();

// First line : e4 Nf6 e5 Nd5

game.playMove({ from: "e2", to: "e4" });
//
game.playMove({ from: "g8", to: "f6" });
game.playMove({ from: "e4", to: "e5" });
game.playMove({ from: "f6", to: "d5" });

game.goPly(1); // back after "e2-e4"

// 2eme line : e4 ... we add : e5 Nf3

game.playMove({ from: "e7", to: "e5" });
game.playMove({ from: "g1", to: "f3" });

game.goPly(1); // back after "e2-e4"

game.playMove({ from: "g8", to: "f6" }); // already exists !
game.playMove({ from: "e4", to: "e5" }); // already exists !
game.playMove({ from: "f6", to: "d5" }); // already exists !

// First line : e4 Nf6 e5 Nd5 ... we add : d4 d6

game.playMove({ from: "d2", to: "d4" });
game.playMove({ from: "d7", to: "d6" });

console.table(game.realHistory); // to see array memory
console.table(game.chess.history()); // to compare with chess.js history

console.table(JSON.stringify(game.displayRealHistory())); // ! all variations stored !

console.log("");
console.log("Use https://jsonformatter.org to view JSON result");
console.log("");
