import { ArrowLeft, Home, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PageNotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#F8F4E9] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
        <div className="w-full text-center">
          {/*  ICON  */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#022B3A] shadow-lg sm:h-28 sm:w-28">
            <MapPin size={48} strokeWidth={1.8} className="text-[#FF8C00]" />
          </div>

          {/*  404  */}
          <div className="mt-8">
            <h1 className="text-7xl font-extrabold tracking-tight text-[#022B3A] sm:text-8xl lg:text-9xl">
              404
            </h1>

            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-[#FF8C00]" />
          </div>

          {/*  TITLE  */}
          <h2 className="mt-7 text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Page Not Found
          </h2>

          {/*  DESCRIPTION */}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
            Sorry, we couldn't find the page you're looking for. It may have
            been moved, removed, or the address you entered may be incorrect.
          </p>

          {/*  ACTIONS  */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* Home */}
            <button
              onClick={() => navigate("/")}
              className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-[#033B4F] hover:shadow-md sm:w-auto"
            >
              <Home size={18} />
              Go to Home
            </button>

            {/* Go Back */}
            <button
              onClick={() => navigate(-1)}
              className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#022B3A]/20 bg-white px-6 py-3.5 text-sm font-semibold text-[#022B3A] transition duration-200 hover:border-[#FF8C00] hover:text-[#FF8C00] sm:w-auto"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>

          {/*  SEARCH HINT  */}
          <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-2 rounded-2xl border border-[#022B3A]/10 bg-white px-5 py-4 shadow-sm">
            <Search size={18} className="shrink-0 text-[#FF8C00]" />

            <p className="text-left text-xs leading-5 text-gray-500 sm:text-sm">
              Looking for a local shop?
              <button
                onClick={() => navigate("/shops")}
                className="cursor-pointer ml-1 font-semibold text-[#022B3A] underline decoration-[#FF8C00] decoration-2 underline-offset-2 transition hover:text-[#FF8C00]"
              >
                Explore shops
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default PageNotFoundPage;
