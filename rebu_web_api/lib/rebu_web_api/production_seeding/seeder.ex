defmodule RebuWebApi.Release.Seeder do
  @moduledoc """
  Release tasks for seeds.
  """

  require Logger

  @app :rebu_web_api

  @doc """
  Seed seeds file for repo.
  """
  @spec seed(Ecto.Repo.t(), String.t()) :: :ok | {:error, any()}
  def seed(repo, filename) do
    load_app()

    {:ok, _} = Application.ensure_all_started(:tzdata)

    case Ecto.Migrator.with_repo(repo, &eval_seed(&1, filename)) do
      {:ok, {:ok, _fun_return}, _apps} ->
        :ok

      {:ok, {:error, reason}, _apps} ->
        Logger.error(reason)
        {:error, reason}

      {:error, term} ->
        IO.warn(term, [])
        {:error, term}
    end
  end

  @spec eval_seed(Ecto.Repo.t(), String.t()) :: any()
  defp eval_seed(repo, filename) do
    seeds_file = get_path("repo", filename)

    Logger.info("Looking for seeds file at: #{seeds_file}")

    if File.regular?(seeds_file) do
      {:ok, Code.eval_file(seeds_file)}
    else
      Logger.error("Seeds file not found at: #{seeds_file}")
      {:error, "Seeds file not found."}
    end
  end

  @spec get_path(String.t(), String.t()) :: String.t()
  defp get_path(directory, filename) do
    priv_dir = :code.priv_dir(@app) |> to_string()
    Path.join([priv_dir, directory, filename])
  end

  @spec load_app() :: :ok | {:error, term()}
  defp load_app(), do: Application.load(@app)
end
