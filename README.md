## Create Conversation


### GraphQL Mutation
```GraphQL
mutation CreateConversations($input: [ConversationCreateInput!]!) {
  createConversations(input: $input) {
    conversations {
      id
      name
    }
  }
}
```

### Mutation `input` Variable

```JSON
{
  "input": [
    {
      "name": "Nice conversation between friends",
      "users": {
        "create": [
          {
            "node": {
              "name": "Brad"
            }
          },
          {
            "node": {
              "name": "Lilly"
            }
          }
        ]
      }
    }
  ]
}
```

### Mutation output

```JSON
{
  "data": {
    "createConversations": {
      "conversations": [
        {
          "id": "8f8faa32-a565-4b48-bf6b-cd69ab4ee82a",
          "name": "Nice conversation between friends"
        }
      ]
    }
  }
}
```


## Subscribe to messageRelationShipCreated

### GraphQL Subscription

```GraphQL
subscription OnMessageCreated($where: MessageRelationshipCreatedSubscriptionWhere) {
  messageRelationshipCreated(where: $where) {
    message {
      id
      body
    }
    createdRelationship {
      seen {
        node {
          id
        }
      }
      sender {
        node {
          id
        }
      }
      conversation {
        node {
          id
        }
      }
    }
  }
}
```

### OnMessageCreated Subscription `where` variable

```JSON
{
  "where": {
    "createdRelationship": {
      "conversation": {
        "node": {
          "name": "Nice conversation between friends"
        }
      }
    }
  }
}
```

## Create a Message

### GraphQL Create Message Mutation

```GraphQL
mutation CreateMessages($input: [MessageCreateInput!]!) {
  createMessages(input: $input) {
    messages {
      id
      conversation {
        id
        name
      }
      body
    }
  }
}
```

### Create Message `input` Variable

```JSON
{
  "input": [
    {
      "body": "Welcome to you!",
      "conversation": {
        "connect": {
          "where": {
            "node": {
              "name": "Nice conversation between friends"
            }
          }
        }
      },
      "sender": {
        "connect": {
          "where": {
            "node": {
              "name": "Brad"
            }
          }
        }
      }
    }
  ]
}
```

### Create Message Output

```JSON
{
  "data": {
    "createMessages": {
      "messages": [
        {
          "id": "e4e4d3bc-b2b9-4f3f-8b39-7fbaf089670c",
          "conversation": {
            "id": "8f8faa32-a565-4b48-bf6b-cd69ab4ee82a",
            "name": "Nice conversation between friends"
          },
          "body": "Welcome to you!"
        }
      ]
    }
  }
}
```

### Subscription ouput

```JSON
// Response received at 12:57:54
{
  "data": {
    "messageRelationshipCreated": {
      "message": {
        "id": "e4e4d3bc-b2b9-4f3f-8b39-7fbaf089670c",
        "body": "Welcome to you!"
      },
      "createdRelationship": {
        "seen": null,
        "sender": null,
        "conversation": {
          "node": {
            "id": "8f8faa32-a565-4b48-bf6b-cd69ab4ee82a"
          }
        }
      }
    }
  }
}
```