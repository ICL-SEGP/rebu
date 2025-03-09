defmodule RebuWebApiWeb.Router do
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
    # referral code
    get "/referral-code", AffiliateController, :get_referral_code

    # Affiliate
    get "/", AffiliateController, :get
    patch "/", AffiliateController, :update
    # TODO implement this && add oban to do this periodically
    delete "/", AffiliateController, :archive

    get "/revenue", AffiliateController, :get_balance
    get "/stats", AffiliateController, :stats

    # Offers
    get "/offers", OfferController, :get_offers
    post "/offers", OfferController, :create
    get "/offers/:id", OfferController, :get
    patch "/offers/:id", OfferController, :update
    delete "/offers/:id", OfferController, :mark_expired

    # users
    get "/users", UserController, :get_linked_users
    get "/users/idx", UserController, :get_linked_users_idx
    post "/users", UserController, :manual_create_user
    get "/users/:id", UserController, :get
    patch "/users/:id", UserController, :update
    # TODO implement this && add oban to do this periodically
    delete "/users/:id", UserController, :archive

    # (User) Orders
    get "/orders", OrderController, :affiliate_get_orders
    get "/orders/:id", OrderController, :affiliate_get
    patch "/orders/:id", OrderController, :affiliate_update
    delete "/order/:id", OrderController, :affiliate_cancel
    post "/orders/user/:id", OrderController, :affiliate_create
    get "/orders/user/:id", OrderController, :affiliate_get_for_user
  end

  scope "/", RebuWebApiWeb do
    pipe_through [:api, :auth]

    # Password Reset
    post "/password-reset", AuthController, :password_reset

    # User Profile
    get "/user", UserController, :get_profile
    patch "/user", UserController, :update_profile
    # TODO implement this && add oban to do this periodically
    delete "/user", UserController, :archive_profile
    get "/user/balance", UserController, :get_balance
    # TODO decide what stats are relevant for the user
    get "/stats", UserController, :stats

    delete "/sign-out", AuthController, :sign_out

    # Orders
    get "/orders", OrderController, :get_orders
    post "/orders", OrderController, :create
    post "/orders/detect", OrderController, :create
    get "/orders/:id", OrderController, :get
    patch "/orders/:id", OrderController, :update
    # create order from offers browser extension

    # Offers
    get "/offers", OfferController, :get_offers_for_user

    # uploads
    # post "/upload", UploadController, :create
    post "/upload/url", UploadController, :gen_presigned_url

    # Marketplace

    patch "/products/:id", ProductController, :update
    post "/products", ProductController, :create
    get "/products", ProductController, :get
    get "/products/all", ProductController, :get_all
    get "/products/:id", ProductController, :get_by_id

    get "/product/:id/reviews", ReviewController, :get_reviews_for_product
    post "/product/reviews/create", ReviewController, :create
    patch "/product/reviews/:id", ReviewController, :update

    post "/category", CategoryController, :create
    get "/category", CategoryController, :get

    post "/purchase", PurchaseController, :make
  end

  scope "/solana", RebuWebApiWeb do
    pipe_through [:api, :auth]
    post "/key", SolanaController, :update_key
    post "/seller-key", SolanaController, :get_seller_pub_key
    get "/balance", SolanaController, :get_balance
  end

  scope "/", RebuWebApiWeb do
    pipe_through :api

    # Auth
    post "/register", AuthController, :register
    post "/affiliate/register", AuthController, :register
    post "/sign-in", AuthController, :sign_in

    # testing
    get "/", TestController, :default
  end

  match :*, "/*path", RebuWebApiWeb.FallbackController, :not_found

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
