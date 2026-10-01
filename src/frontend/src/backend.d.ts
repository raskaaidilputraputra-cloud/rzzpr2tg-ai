import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface ChatMessage {
    id: MessageId;
    content: string;
    createdAt: Timestamp;
    role: MessageRole;
}
export interface ChatRequest {
    messages: Array<ChatTurn>;
    conversationId?: ConversationId;
    systemPrompt?: string;
}
export interface ChatResponse {
    conversationId: ConversationId;
    message: ChatMessage;
    reply: string;
}
export interface ChatStreamResponse {
    conversationId: ConversationId;
    message: ChatMessage;
    chunks: Array<string>;
}
export interface ChatTurn {
    content: string;
    role: MessageRole;
}
export interface Conversation {
    id: ConversationId;
    title: string;
    messages: Array<ChatMessage>;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export type ConversationId = bigint;
export interface ConversationSummary {
    id: ConversationId;
    title: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    messageCount: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type MessageId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export interface UserProfile {
    displayName: string;
    photoUrl?: string;
    email?: string;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum MessageRole {
    user = "user",
    assistant = "assistant"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Delete one of the caller's conversations.
     */
    deleteConversation(id: ConversationId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown documentation of the public backend API.
     */
    getApiDoc(): Promise<string>;
    /**
     * / Read the caller's own profile.
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Load one of the caller's conversations.
     */
    getConversation(id: ConversationId): Promise<Conversation | null>;
    /**
     * / Read a profile by principal. A caller may only read its own profile;
     * / admins may read any profile. Anonymous callers receive null.
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List the caller's conversations, newest first.
     */
    listConversations(): Promise<Array<ConversationSummary>>;
    /**
     * / Create or replace the caller's own profile.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    schema(): Promise<string>;
    /**
     * / Run a chat completion and persist the exchange for signed-in users.
     */
    sendChatMessage(request: ChatRequest): Promise<ChatResponse>;
    /**
     * / Run a chat completion and return the reply split into ordered chunks so
     * / the frontend can render it incrementally. Persists the exchange for
     * / signed-in users exactly like `sendChatMessage`; guests stay unpersisted.
     */
    sendChatMessageStream(request: ChatRequest): Promise<ChatStreamResponse>;
}
