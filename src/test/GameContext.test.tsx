/// <reference types="vitest/globals" />
import { render, screen, fireEvent, act } from "@testing-library/react";
import { GameProvider, useGame } from "@/context/GameContext";

// ─── Harness ──────────────────────────────────────────────────────────────────
function Harness() {
  const { state, handleChar, resetCounter, setTheme } = useGame();
  return (
    <div>
      <span data-testid="count">{state.smashCount}</span>
      <span data-testid="theme">{state.themeId}</span>
      <button onClick={() => handleChar("A")}>smash</button>
      {state.smashCount > 0 && (
        <button onClick={() => resetCounter()}>reset</button>
      )}
      <button onClick={() => setTheme("ocean")}>ocean</button>
      <button onClick={() => setTheme("space")}>space</button>
    </div>
  );
}

function wrap(ui: React.ReactElement) {
  return render(<GameProvider>{ui}</GameProvider>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("GameContext", () => {
  it("increments smashCount on handleChar", () => {
    wrap(<Harness />);
    expect(screen.getByTestId("count").textContent).toBe("0");
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("reset button works — counter goes to 0", () => {
    wrap(<Harness />);
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("2");

    act(() => { fireEvent.click(screen.getByRole("button", { name: "reset" })); });
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.queryByRole("button", { name: "reset" })).toBeNull();
  });

  it("counter keeps incrementing after theme switch", () => {
    wrap(<Harness />);
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "ocean" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "space" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("3");
  });

  it("counter keeps incrementing after reset + theme switch", () => {
    wrap(<Harness />);
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "ocean" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "reset" })); });
    expect(screen.getByTestId("count").textContent).toBe("0");
    act(() => { fireEvent.click(screen.getByRole("button", { name: "space" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("smash → reset → smash works correctly", () => {
    wrap(<Harness />);
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "reset" })); });
    expect(screen.getByTestId("count").textContent).toBe("0");
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("counter keeps incrementing past 130 smashes (AudioContext node-limit regression)", () => {
    wrap(<Harness />);
    act(() => {
      for (let i = 0; i < 140; i++) {
        fireEvent.click(screen.getByRole("button", { name: "smash" }));
      }
    });
    expect(screen.getByTestId("count").textContent).toBe("140");
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("141");
  });

  it("counter and reset both work past 225 smashes", () => {
    wrap(<Harness />);
    // Smash 225 times
    act(() => {
      for (let i = 0; i < 225; i++) {
        fireEvent.click(screen.getByRole("button", { name: "smash" }));
      }
    });
    expect(screen.getByTestId("count").textContent).toBe("225");

    // Counter must still increment at 225+
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("226");

    // Reset must work at 226
    act(() => { fireEvent.click(screen.getByRole("button", { name: "reset" })); });
    expect(screen.getByTestId("count").textContent).toBe("0");

    // Counter must work again after reset
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    act(() => { fireEvent.click(screen.getByRole("button", { name: "smash" })); });
    expect(screen.getByTestId("count").textContent).toBe("2");
  });
});
