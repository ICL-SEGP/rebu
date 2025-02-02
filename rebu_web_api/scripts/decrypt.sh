#!/bin/bash

# Get the path of the secrets/ folder relative to the current script
CURRENT_SCRIPT_DIRECTORY=$(dirname "$0")
SECRETS_DIRECTORY="$CURRENT_SCRIPT_DIRECTORY/../priv/secrets"

# Decrypt the file and store the output in a variable
decrypted_content=$(sops --decrypt "$SECRETS_DIRECTORY/secrets.enc.yaml")

# Read and export each variable without a subshell
while IFS=: read -r key value; do
    value=$(echo "$value" | xargs)  # Trim whitespace
    export "$key"="$value"  # Export variable
done <<< "$decrypted_content"