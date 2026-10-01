import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  await expect(actor.listConversations()).resolves.toEqual([]);
  await expect(actor.getConversation(0n)).resolves.toEqual([]);
  await expect(actor.getCallerUserProfile()).resolves.toEqual([]);
});

it("round-trips a profile through the real canister", async () => {
  const alice = createIdentity("alice");
  actor.setIdentity(alice);

  await actor.saveCallerUserProfile({
    displayName: "Ada Lovelace",
    email: ["ada@example.com"],
    photoUrl: [],
  });

  const profile = await actor.getCallerUserProfile();
  expect(profile).toHaveLength(1);
  expect(profile[0]).toMatchObject({
    displayName: "Ada Lovelace",
    email: ["ada@example.com"],
  });
});

it("does not show one caller's profile to another", async () => {
  const alice = createIdentity("alice");
  const bob = createIdentity("bob");

  actor.setIdentity(alice);
  await actor.saveCallerUserProfile({ displayName: "Alice", email: [], photoUrl: [] });

  actor.setIdentity(bob);
  await expect(actor.getCallerUserProfile()).resolves.toEqual([]);
});

it("returns no conversations for an anonymous caller", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.listConversations()).resolves.toEqual([]);
  await expect(guest.getConversation(0n)).resolves.toEqual([]);
  await expect(guest.getCallerUserProfile()).resolves.toEqual([]);
});

it("rejects a chat request with no messages", async () => {
  const alice = createIdentity("alice");
  actor.setIdentity(alice);
  await expect(
    actor.sendChatMessageStream({ messages: [], conversationId: [], systemPrompt: [] }),
  ).rejects.toThrow();
});

it("reports a missing conversation as not deleted instead of trapping", async () => {
  const alice = createIdentity("alice");
  actor.setIdentity(alice);
  await expect(actor.deleteConversation(999n)).resolves.toBe(false);
});

it("refuses to delete a conversation for an anonymous caller", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.deleteConversation(0n)).resolves.toBe(false);
});
