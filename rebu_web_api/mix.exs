defmodule RebuWebApi.MixProject do
  use Mix.Project

  def project do
    [
      app: :rebu_web_api,
      version: "0.1.0",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: [
        # rebu_web_api: [
        #   config_providers: [
        #     {
        #       SopsConfigProvider,
        #       %{
        #         app_name: :rebu_web_api,
        #         secret_file_path: "priv/secrets/secrets.enc.yaml"
        #       }
        #     }
        #   ]
        # ]
      ]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {RebuWebApi.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.7.18"},
      {:phoenix_ecto, "~> 4.5"},
      {:ecto_sql, "~> 3.10"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 4.1"},
      {:phoenix_live_reload, "~> 1.2", only: :dev},
      {:phoenix_live_view, "~> 1.0.0"},
      {:floki, ">= 0.30.0", only: :test},
      {:phoenix_live_dashboard, "~> 0.8.3"},
      {:esbuild, "~> 0.8", runtime: Mix.env() == :dev},
      {:tailwind, "~> 0.2", runtime: Mix.env() == :dev},
      {:heroicons,
       github: "tailwindlabs/heroicons",
       tag: "v2.1.1",
       sparse: "optimized",
       app: false,
       compile: false,
       depth: 1},
      {:swoosh, "~> 1.5"},
      {:finch, "~> 0.13"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:gettext, "~> 0.26"},
      {:jason, "~> 1.2"},
      {:dns_cluster, "~> 0.1.1"},
      {:bandit, "~> 1.5"},
      {:guardian, "~> 2.3"},
      {:bcrypt_elixir, "~> 3.2"},
      {:styler, "~> 1.3", only: [:dev, :test], runtime: false},
      {:cors_plug, "~> 3.0"},
      {:sops_config_provider, "~> 0.2.1"},
      {:faker, "~> 0.18.0"},
      {:ex_machina, "~> 2.7.0"},
      {:timex, "~> 3.7"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "assets.setup", "assets.build"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      "assets.setup": ["tailwind.install --if-missing", "esbuild.install --if-missing"],
      "assets.build": ["tailwind rebu_web_api", "esbuild rebu_web_api"],
      "assets.deploy": [
        "tailwind rebu_web_api --minify",
        "esbuild rebu_web_api --minify",
        "phx.digest"
      ],
      ci: [
        "cmd echo \"----------------------- 🚀 Compiling with warnings as errors... -----------------------\n\"",
        "compile --warnings-as-errors",
        "cmd echo \"----------------------- 🚀 Compiling Complete. -----------------------\n\"",
        "cmd echo \"----------------------- 🧪 Running tests with max failures set to 1, trace, and warnings as errors... -----------------------\n\"",
        "cmd MIX_ENV=test mix test --max-failures 1 --trace --warnings-as-errors",
        "cmd echo \"----------------------- 🧪 Testing Complete. -----------------------\n\"",
        "cmd echo \"----------------------- ✨ Checking if the code is formatted... -----------------------\n\"",
        "cmd MIX_ENV=dev",
        "format --check-formatted",
        "cmd echo \"----------------------- ✨ Check Complete. -----------------------\n\"",
        "cmd echo \"----------------------- 🔗 Checking for unused dependencies... -----------------------\n\"",
        "deps.unlock --check-unused",
        "cmd echo \"----------------------- 🔗 Check Complete. -----------------------\n\""
      ]
    ]
  end
end
