import { fromEnv } "mo:caffeineai-inference-client/Config";
import ChatApi "mo:caffeineai-inference-client/Apis/ChatApi";
import ChatCompletionRequest "mo:caffeineai-inference-client/Models/ChatCompletionRequest";
import ChatCompletionRequestMessage "mo:caffeineai-inference-client/Models/ChatCompletionRequestMessage";
import ChatCompletionRequestMessageOneOf "mo:caffeineai-inference-client/Models/ChatCompletionRequestMessageOneOf";
import ChatCompletionRequestMessageOneOf2 "mo:caffeineai-inference-client/Models/ChatCompletionRequestMessageOneOf2";
import ChatCompletionRequestMessageOneOf3 "mo:caffeineai-inference-client/Models/ChatCompletionRequestMessageOneOf3";
import Runtime "mo:core/Runtime";
import Types "../types/chat";

module {
  /// Run one chat completion against Caffeine Inference.
  /// `history` is the ordered conversation (oldest first); `systemPrompt`
  /// optionally prepends a system instruction.
  public func runChat<system>(
    history : [Types.ChatTurn],
    systemPrompt : ?Text,
  ) : async* Text {
    let config = fromEnv<system>();

    let messages = history.map(
      func(turn) : ChatCompletionRequestMessage.ChatCompletionRequestMessage {
        switch (turn.role) {
          case (#user) {
            #user(
              ChatCompletionRequestMessageOneOf2.JSON.init({
                content = #string(turn.content);
                role = #user;
              })
            );
          };
          case (#assistant) {
            let base = ChatCompletionRequestMessageOneOf3.JSON.init({
              role = #assistant;
            });
            #assistant({ base with content = ?#string(turn.content) });
          };
        };
      }
    );

    let withSystem = switch (systemPrompt) {
      case (?prompt) {
        let systemMessage = #system_(
          ChatCompletionRequestMessageOneOf.JSON.init({
            content = #string(prompt);
            role = #system_;
          })
        );
        [systemMessage].concat(messages);
      };
      case null { messages };
    };

    let req = ChatCompletionRequest.JSON.init({
      messages = withSystem;
      model = "router";
    });

    let resp = await* ChatApi.createChatCompletion(config, req);
    if (resp.choices.size() == 0) {
      Runtime.trap("Inference returned no choices");
    };
    resp.choices[0].message.content
      ?? Runtime.trap("Inference returned no text content");
  };
};
