defmodule RebuWebApiWeb.Router do
  alias Hex.API.User
  use RebuWebApiWeb, :router

  import RebuWebApi.Auth.AccountPlugs

  # pipeline :browser do
  #   plug :accepts, ["html"]
  #   plug :fetch_session
  #   plug :fetch_live_flash
  #   plug :put_root_layout, html: {RebuWebApiWeb.Layouts, :root}
  #   plug :protect_from_forgery
  #   plug :put_secure_browser_headers
  # end

  def handle_errors(conn, %{reason: %Phoenix.Router.NoRouteError{message: message}}) do
    conn |> json(%{errors: message}) |> halt()
  end

  def handle_errors(conn, %{reason: %{message: message}}) do
    conn |> json(%{errors: message}) |> halt()
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
  end

  pipeline :auth do
    plug RebuWebApi.Auth.Pipeline
    plug :fetch_account
  end

  pipeline :affiliate do
    plug RebuWebApi.Auth.Pipeline
    plug :is_affiliate
  end

  scope "/affiliate", RebuWebApiWeb do
    pipe_through [:api, :auth, :affiliate]

    # Affiliate
    get "", AffiliateController, :get
    patch "", AffiliateController, :update
    delete "", AffiliateController, :archive
    get "/balance", AffiliateController, :get_balance
    get "/stats", AffiliateController, :stats

    # Offers
    get "/offers", OrderController, :get_offers
    post "/offers", OrderController, :create
    get "/offers/:id", OrderController, :get
    patch "/offers/:id", OrderController, :update
    delete "/offers/:id", OrderController, :mark_expired

    #users
    get "/users", UserController, :get_users
    post "/users", UserController, :manual_create_user
    get "/users/:id", UserController, :get
    patch "/users/:id", UserController, :update
    delete "/users/:id", UserController, :archive

    #(User) Orders
    get "/orders", OrderController, :affiliate_get_orders
    post "/orders", OrderController, :affiliate_create
    get "/orders/:id", OrderController, :affiliate_get
    patch "/orders/:id", OrderController, :affiliate_update
    delete "/order/:id", OrderController, :affiliate_cancel
    get "/orders/user/:id", OrderController, :affiliate_get_for_user
  end

  scope "", RebuWebApiWeb do
    pipe_through [:api, :auth]

    # User Profile
    get "/user", UserController, :get_profile
    patch "/user", UserController, :update_profile
    delete "/user", UserController, :archive_profile
    get "/user/balance", UserController, :get_balance
    get "/stats", UserController, :stats

    delete "/logout", AuthController, :sign_out

    # Orders
    get "/orders", OrderController, :get_orders
    post "/orders", OrderController, :create
    get "/orders/:id", OrderController, :get
    patch "/orders/:id", OrderController, :update

    # Offers
    get "/offers", OfferController, :get_offers_for_user
  end

  scope "/solana" do
    pipe_through [:api, :auth]
    post "/key", SolanaController, :update_key
  end

  scope "", RebuWebApiWeb do
    pipe_through :api

    # Auth
    post "/register", AuthController, :register
    post "/affiliate/register", AuthController, :register
    post "/login", AuthController, :sign_in

    # testing
    get "/", TestController, :default
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  # if Application.compile_env(:rebu_web_api, :dev_routes) do
  #   # If you want to use the LiveDashboard in production, you should put
  #   # it behind authentication and allow only admins to access it.
  #   # If your application does not have an admins-only section yet,
  #   # you can use Plug.BasicAuth to set up some basic authentication
  #   # as long as you are also using SSL (which you should anyway).
  #   import Phoenix.LiveDashboard.Router

  #   scope "/dev" do
  #     pipe_through :browser

  #     live_dashboard "/dashboard", metrics: RebuWebApiWeb.Telemetry
  #     forward "/mailbox", Plug.Swoosh.MailboxPreview
  #   end
  # end
end
