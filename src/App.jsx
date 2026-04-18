import { useState } from "react";
import GlobalStyles from "./components/GlobalStyles";
import HomeScreen from "./screens/HomeScreen";
import ListScreen from "./screens/ListScreen";
import EditScreen from "./screens/EditScreen";
import PracticeScreen from "./screens/PracticeScreen";
import { DictatRepository } from "./data/repository";
import { tokenize, computeHiddenIndices } from "./utils/tokenizer";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeId, setActiveId] = useState(null);
  const nav = {
    home: () => {
      setScreen("home");
      setActiveId(null);
    },
    list: () => {
      setScreen("list");
      setActiveId(null);
    },
    edit: (id) => {
      setActiveId(id);
      setScreen("edit");
    },
    practice: (id) => {
      setActiveId(id);
      setScreen("practice");
    },
    createFromText: (text) => {
      const d = DictatRepository.createNew(text);
      d.hiddenIndices = computeHiddenIndices(tokenize(text), d.config.hidePct);
      DictatRepository.save(d);
      setActiveId(d.id);
      setScreen("edit");
    },
    createNew: () => {
      const d = DictatRepository.createNew();
      DictatRepository.save(d);
      setActiveId(d.id);
      setScreen("edit");
    },
    deleteDictat: (id) => {
      DictatRepository.remove(id);
      setActiveId(null);
      setScreen("list");
    },
  };
  return (
    <>
      <GlobalStyles />
      {screen === "home" && (
        <HomeScreen onCreateDictat={nav.createFromText} onShowList={nav.list} />
      )}
      {screen === "list" && (
        <ListScreen
          onBack={nav.home}
          onEdit={nav.edit}
          onPractice={nav.practice}
          onNew={nav.createNew}
        />
      )}
      {screen === "edit" && (
        <EditScreen
          key={activeId}
          dictatId={activeId}
          onBack={nav.list}
          onPractice={nav.practice}
          onDelete={nav.deleteDictat}
        />
      )}
      {screen === "practice" && (
        <PracticeScreen
          key={activeId + "_p"}
          dictatId={activeId}
          onBack={() => nav.edit(activeId)}
        />
      )}
    </>
  );
}
