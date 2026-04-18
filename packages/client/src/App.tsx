import { useState } from "react";
import GlobalStyles from "./components/GlobalStyles";
import HomeScreen from "./screens/HomeScreen";
import ListScreen from "./screens/ListScreen";
import EditScreen from "./screens/EditScreen";
import PracticeScreen from "./screens/PracticeScreen";
import { DictatRepository } from "./data/repository";
import { tokenize, computeHiddenIndices } from "./utils/tokenizer";

type Screen = "home" | "list" | "edit" | "practice";

interface Nav {
  home: () => void;
  list: () => void;
  edit: (id: string) => void;
  practice: (id: string) => void;
  createFromText: (text: string) => void;
  createNew: () => void;
  deleteDictat: (id: string) => void;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeId, setActiveId] = useState<string | null>(null);
  const nav: Nav = {
    home: () => {
      setScreen("home");
      setActiveId(null);
    },
    list: () => {
      setScreen("list");
      setActiveId(null);
    },
    edit: (id: string) => {
      setActiveId(id);
      setScreen("edit");
    },
    practice: (id: string) => {
      setActiveId(id);
      setScreen("practice");
    },
    createFromText: (text: string) => {
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
    deleteDictat: (id: string) => {
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
      {screen === "edit" && activeId !== null && (
        <EditScreen
          key={activeId}
          dictatId={activeId}
          onBack={nav.list}
          onPractice={nav.practice}
          onDelete={nav.deleteDictat}
        />
      )}
      {screen === "practice" && activeId !== null && (
        <PracticeScreen
          key={activeId + "_p"}
          dictatId={activeId}
          onBack={() => nav.edit(activeId)}
        />
      )}
    </>
  );
}
