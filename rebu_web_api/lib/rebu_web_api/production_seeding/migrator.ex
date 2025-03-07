# defmodule RebuWebApi.Release.Migrator do
#   @moduledoc """
#   Handles database migrations and resets in a release-friendly environment.
#   """

#   require Logger

#   @app :rebu_web_api

#   @spec reset(Ecto.Repo.t()) :: :ok | {:error, any()}
#   def reset(repo) do
#     load_app()

#     Logger.info("Dropping database...")
#     case Ecto.Migrator.with_repo(repo, fn _ -> repo.__adapter__.storage_down(repo.config) end) do
#       :ok -> :ok
#       {:error, reason} -> Logger.error("Failed to drop database: #{inspect(reason)}")
#     end

#     Logger.info("Creating database...")
#     case Ecto.Migrator.with_repo(repo, fn _ -> repo.__adapter__.storage_up(repo.config) end) do
#       :ok -> :ok
#       {:error, reason} -> Logger.error("Failed to create database: #{inspect(reason)}")
#     end

#     Logger.info("Running migrations...")
#     case Ecto.Migrator.run(repo, :up, all: true) do
#       [] -> Logger.info("No migrations found.")
#       _ -> Logger.info("Migrations applied successfully.")
#     end

#     Logger.info("Seeding database...")
#     case RebuWebApi.Release.Seeder.seed(repo, "seeds.exs") do
#       :ok -> Logger.info("Seeding completed successfully.")
#       {:error, reason} -> Logger.error("Seeding failed: #{inspect(reason)}")
#     end
#   end

#   @spec load_app() :: :ok | {:error, term()}
#   defp load_app(), do: Application.load(@app)
# end
