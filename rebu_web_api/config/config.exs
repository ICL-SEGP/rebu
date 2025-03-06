# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

# Guardian config

config :rebu_web_api, RebuWebApi.Auth.Guardian,
  issuer: "rebu_web_api",
  secret_key: "aBaKJGLEf/MGhpgOaVOidvypHHIRHeY9S0xlYW7ita7GeAylQCWTqRqgWX+ZwRzU"

config :rebu_web_api, RebuWebApi.Repo, start_apps_before_migration: [:logger]

# config :rustler,
#   rustler_crates: [
#     solana_api: [
#       path: "native/solana_api",
#       mode: :precompiled,
#       precompiled_path: "priv/native/libsolana_api.so"
#     ]
#   ]

# config :rebu_web_api, RebuWebApi.SolanaApi,
#   crate: "solana_api",
#   cargo: {:bin, "priv/native/solana_api.so"}

config :rebu_web_api, RebuWebApi.SolanaApi,
  crate: "solana_api",
  skip_compilation?: true,
  load_from: {:rebu_web_api, "priv/native/libsolana_api"}

config :rebu_web_api,
  ecto_repos: [RebuWebApi.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :rebu_web_api, RebuWebApiWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: RebuWebApiWeb.ErrorHTML, json: RebuWebApiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: RebuWebApi.PubSub,
  live_view: [signing_salt: "qbKmAvaS"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :rebu_web_api, RebuWebApi.Mailer, adapter: Swoosh.Adapters.ExAwsAmazonSES
config :swoosh, :api_client, Swoosh.ApiClient.Hackney

# Configure esbuild (the version is required)
config :esbuild,
  version: "0.17.11",
  rebu_web_api: [
    args:
      ~w(js/app.js --bundle --target=es2017 --outdir=../priv/static/assets --external:/fonts/* --external:/images/*),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

# Configure tailwind (the version is required)
config :tailwind,
  version: "3.4.3",
  rebu_web_api: [
    args: ~w(
      --config=tailwind.config.js
      --input=css/app.css
      --output=../priv/static/assets/app.css
    ),
    cd: Path.expand("../assets", __DIR__)
  ]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason
config :jason, :protocol, true

config :elixir, :inspect, limit: :infinity, pretty: true

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.

import_config "sops_config.exs"
import_config "#{config_env()}.exs"
