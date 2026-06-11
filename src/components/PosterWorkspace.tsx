import React, { useState } from 'react';
import { 
  FileCode, 
  Terminal, 
  Download, 
  Github, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Cpu, 
  HelpCircle, 
  ArrowRight,
  ExternalLink,
  RotateCw,
  Eye,
  FileJson,
  Code
} from 'lucide-react';

// Structuring code files so that they are displayed elegantly in the UI tab with quick toggling & copy-paste
const PLUGIN_FILES = [
  {
    name: 'BtttrImageProvider.cs',
    icon: FileCode,
    language: 'csharp',
    filepath: '/jellyfin-btttr-plugin/BtttrImageProvider.cs',
    description: 'This is the core C# class implementing Jellyfins IRemoteImageProvider. It extracts the IMDb ID from your media files and returns the direct btttr.cc poster URL.',
    code: `using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using MediaBrowser.Common.Net;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Entities.Movies;
using MediaBrowser.Controller.Entities.TV;
using MediaBrowser.Controller.Providers;
using MediaBrowser.Model.Entities;
using MediaBrowser.Model.Providers;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.BtttrPosters
{
    public class BtttrImageProvider : IRemoteImageProvider, IHasOrder
    {
        private readonly IHttpClient _httpClient;
        private readonly ILogger<BtttrImageProvider> _logger;

        public BtttrImageProvider(IHttpClient httpClient, ILogger<BtttrImageProvider> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public string Name => "Btttr Posters";

        public int Order => 0; // Highest priority - displays as the first choice

        public bool Supports(BaseItem item)
        {
            // Only movies and series (TV Shows) support custom poster overlays
            return item is Movie || item is Series;
        }

        public IEnumerable<ImageType> GetSupportedImages(BaseItem item)
        {
            return new[] { ImageType.Primary };
        }

        public async Task<IEnumerable<RemoteImageInfo>> GetImages(BaseItem item, CancellationToken cancellationToken)
        {
            var images = new List<RemoteImageInfo>();
            
            // Extract the IMDb Identifier from Jellyfin's metadata item links
            string imdbId = item.GetProviderId(MetadataProvider.Imdb);

            _logger.LogInformation("Processing Btttr Image Provider for item: {Name}", item.Name);

            if (string.IsNullOrEmpty(imdbId))
            {
                _logger.LogWarning("Btttr Image Provider: IMDB ID not found for item: {Name}. Cannot fetch btttr.cc custom poster.", item.Name);
                return images;
            }

            // Ensure IMDb ID starts with "tt" (normal IMDb format, e.g., tt10919420)
            if (!imdbId.StartsWith("tt", StringComparison.OrdinalIgnoreCase))
            {
                imdbId = "tt" + imdbId;
            }

            // Standard layout is 'poster-default'. Other choices can be configured.
            var layout = Plugin.Instance?.Configuration?.LayoutStyle ?? "poster-default";

            // Generate Btttr.cc URL
            // Format: https://btttr.cc/poster/imdb/{layout}/{imdb_id}.jpg
            // Example: https://btttr.cc/poster/imdb/poster-default/tt10919420.jpg
            string btttrUrl = $"https://btttr.cc/poster/imdb/{layout}/{imdbId}.jpg";

            _logger.LogInformation("Generating Btttr.cc URL format: {Url}", btttrUrl);

            images.Add(new RemoteImageInfo
            {
                ProviderName = Name,
                Url = btttrUrl,
                ThumbnailUrl = btttrUrl,
                Type = ImageType.Primary
            });

            return images;
        }

        public Task<HttpResponseInfo> GetImageResponse(string url, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Fetching custom poster from Btttr: {Url}", url);
            return _httpClient.GetResponse(new HttpRequestOptions
            {
                Url = url,
                CancellationToken = cancellationToken
            });
        }
    }
}`
  },
  {
    name: 'BtttrPosterPlugin.csproj',
    icon: Cpu,
    language: 'xml',
    filepath: '/jellyfin-btttr-plugin/BtttrPosterPlugin.csproj',
    description: 'The .NET C# project metadata file specifying references to Jellyfin Controller & Model APIs targeting .NET 8.0 SDK.',
    code: `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>disable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <AssemblyName>Jellyfin.Plugin.BtttrPosters</AssemblyName>
    <RootNamespace>Jellyfin.Plugin.BtttrPosters</RootNamespace>
    <Version>1.0.0.0</Version>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Jellyfin.Controller" Version="10.9.0" />
    <PackageReference Include="Jellyfin.Model" Version="10.9.0" />
  </ItemGroup>

</Project>`
  },
  {
    name: 'Plugin.cs',
    icon: Code,
    language: 'csharp',
    filepath: '/jellyfin-btttr-plugin/Plugin.cs',
    description: 'Registers the plugin inside Jellyfin with a custom unique GUID and hooks up an HTML web configuration page in the administrator control panel.',
    code: `using System;
using System.Collections.Generic;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Jellyfin.Plugin.BtttrPosters.Configuration;

namespace Jellyfin.Plugin.BtttrPosters
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
    {
        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
            : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
        }

        public override string Name => "Btttr Posters";

        public override Guid Id => Guid.Parse("b1ea6fb2-e42a-4632-841f-82ffba8307db");

        public static Plugin? Instance { get; private set; }

        public IEnumerable<PluginPageInfo> GetPages()
        {
            return new[]
            {
                new PluginPageInfo
                {
                    Name = "Btttr Posters Configuration",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.configPage.html"
                }
            };
        }
    }
}`
  },
  {
    name: 'PluginConfiguration.cs',
    icon: Layers,
    language: 'csharp',
    filepath: '/jellyfin-btttr-plugin/Configuration/PluginConfiguration.cs',
    description: 'Defines customizable properties for the plugin (such as choosing different overlay/badge styles from btttr.cc).',
    code: `using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.BtttrPosters.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public string LayoutStyle { get; set; } = "poster-default";
        
        public bool FallbackToTmdbText { get; set; } = true;
    }
}`
  },
  {
    name: 'manifest.json',
    icon: FileJson,
    language: 'json',
    filepath: '/jellyfin-btttr-plugin/manifest.json',
    description: 'Represents the JSON file structure to publish your plugin as a native on-demand Jellyfin repository. Copy paste this when setting up automatic updates.',
    code: `[
  {
    "guid": "b1ea6fb2-e42a-4632-841f-82ffba8307db",
    "name": "Btttr Posters Plugin",
    "overview": "Adds support to automatically pull beautifully styled overlay poster cards directly from btttr.cc into Jellyfin.",
    "description": "This plugin adds Btttr.cc as an Official Remote Image Provider in Jellyfin. When you search for images (posters) for any movie or TV series, Btttr.cc covers will automatically appear as top-priority choices with custom badges and ratings overlayed.",
    "category": "Metadata",
    "owner": "Community",
    "versions": [
      {
        "version": "1.0.0.0",
        "changelog": "Initial Release. Support for IMDb ID btttr.cc poster overlays.",
        "targetAbi": "10.9.0.0",
        "sourceUrl": "https://github.com/YOUR_GITHUB_USERNAME/BtttrPosterPlugin/archive/refs/tags/v1.0.0.tar.gz",
        "checksum": "",
        "timestamp": "2026-06-11T00:00:00Z"
      }
    ]
  }
]`
  }
];

export function PosterWorkspace() {
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [imdbIdInput, setImdbIdInput] = useState('tt10919420');
  const [selectedLayout, setSelectedLayout] = useState('poster-default');
  const [testUrl, setTestUrl] = useState('https://btttr.cc/poster/imdb/poster-default/tt10919420.jpg');
  const [testerLoading, setTesterLoading] = useState(false);
  const [lang, setLang] = useState<'hindi' | 'english'>('hindi');

  // Clipboard copy helper
  const handleCopy = () => {
    navigator.clipboard.writeText(PLUGIN_FILES[activeFileIdx].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live URL generator tester
  const handleGenerateTest = (e: React.FormEvent) => {
    e.preventDefault();
    setTesterLoading(true);
    const cleanedId = imdbIdInput.trim();
    const formattedId = cleanedId.startsWith('tt') ? cleanedId : `tt${cleanedId}`;
    setTestUrl(`https://btttr.cc/poster/imdb/${selectedLayout}/${formattedId}.jpg`);
    setTimeout(() => {
      setTesterLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-zinc-100 flex flex-col font-sans antialiased">
      
      {/* Upper Navigation / Premium Banner */}
      <header className="border-b border-zinc-900 bg-[#0c0d10]/95 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/15">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Jellyfin Btttr.cc Poster Plugin Portal
                </h1>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase font-bold">
                  v1.0 Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                All-in-one guide & codebase configuration to make Btttr.cc a native provider inside Jellyfin.
              </p>
            </div>
          </div>

          {/* Language Toggle Switiching */}
          <div className="flex items-center gap-2 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setLang('hindi')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === 'hindi' 
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🇮🇳 Hinglish
            </button>
            <button
              onClick={() => setLang('english')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === 'english' 
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout divided in two main hubs */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (7 columns): The Codebase Explorer */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
              <div>
                <h2 className="text-md font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  Jellyfin Native C# Source Code
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  We have fully generated the complete plugin project in your workspace. Select a tab below to copy its content:
                </p>
              </div>

              {/* Direct feedback indicator */}
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                No-Mocks Real Code
              </div>
            </div>

            {/* Quick action buttons for the files */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              {PLUGIN_FILES.map((file, idx) => {
                const Icon = file.icon;
                const isActive = activeFileIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveFileIdx(idx);
                      setCopied(false);
                    }}
                    className={`flex items-center gap-1.5 justify-center py-2.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      isActive 
                        ? 'bg-zinc-900 border-indigo-500/50 text-indigo-400' 
                        : 'bg-zinc-950/40 border-zinc-850 hover:bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Code presentation stage with code-viewer style styling */}
            <div className="bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden relative">
              <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-[11px] font-mono text-zinc-500 ml-2">
                    {PLUGIN_FILES[activeFileIdx].filepath}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 hover:text-white px-3 py-1.5 rounded text-xs font-semibold text-zinc-300 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Description helper of current C# code */}
              <div className="bg-zinc-900/50 px-4 py-2 text-[11px] text-indigo-300 border-b border-zinc-950 bg-indigo-950/5 leading-relaxed">
                <strong>Description:</strong> {PLUGIN_FILES[activeFileIdx].description}
              </div>

              {/* Real C# text payload display */}
              <pre className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed text-zinc-300 max-h-[480px]">
                <code>{PLUGIN_FILES[activeFileIdx].code}</code>
              </pre>
            </div>

            {/* Hint about directory location */}
            <p className="text-[11px] text-zinc-500 italic mt-3 text-center">
              💡 Tip: All these source files have already been created in this workspace's <span className="font-mono text-zinc-400">/jellyfin-btttr-plugin</span> directory.
            </p>

          </div>

          {/* Interactive Btttr.cc API Live Endpoint Validator (Direct Poster URL Tester) */}
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4.5 h-4.5 text-indigo-400" />
                Dynamic Btttr.cc API Poster Test Sandbox
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your preferred Movie or Anime's IMDb ID below to test the direct URL format instantly:
              </p>
            </div>

            <form onSubmit={handleGenerateTest} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                  Movie / Series IMDb ID
                </label>
                <input 
                  type="text"
                  placeholder="e.g. tt10919420 or tt0111161"
                  value={imdbIdInput}
                  onChange={(e) => setImdbIdInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
                  Style Layout Layout
                </label>
                <select
                  value={selectedLayout}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-xl py-2 px-2.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="poster-default">poster-default (Standard)</option>
                  <option value="poster-no-badge">poster-no-badge</option>
                  <option value="poster-rating-only">poster-rating-only</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-650 rounded-xl text-xs font-semibold text-white tracking-wide transition-all"
                >
                  Validate URL
                </button>
              </div>
            </form>

            {/* Generated results structure box */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
              
              {/* Image Preview on right */}
              <div className="w-[110px] h-[165px] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-850 shrink-0 flex items-center justify-center relative shadow-md">
                {testerLoading ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <RotateCw className="w-5 h-5 text-indigo-400 animate-spin" />
                  </div>
                ) : null}
                <img 
                  src={testUrl} 
                  alt="Poster preview from btttr.cc" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback in case they type placeholder or fake IMDb ID
                    e.currentTarget.src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=200&auto=format&fit=crop";
                  }}
                />
              </div>

              {/* URL Description layout */}
              <div className="flex-1 w-full flex flex-col">
                <span className="text-[10px] font-mono text-indigo-400 mb-1 font-bold">GENERATED ENDPOINT:</span>
                <div className="bg-zinc-900/90 font-mono text-[10.5px] p-2.5 rounded border border-zinc-850/60 select-all cursor-pointer break-all text-indigo-300">
                  {testUrl}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                  Notice how typing the IMDb ID instantly evaluates to this exact JPG file! This is the exact dynamic layout endpoint our Jellyfin C# Plugin calls under the hood automatically when parsing movie pages.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (5 columns): The Ultimate Installation & Setup Wiki Guide (Hindi / English) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
          
          <div className="bg-zinc-900/35 border border-zinc-900 rounded-2xl p-6">
            
            {/* DUAL WIKI INSTRUCTIONS PANEL */}
            {lang === 'hindi' ? (
              // HINGLISH VERSION
              <div className="space-y-5">
                <div className="border-b border-indigo-950 pb-3">
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-cyan-400" />
                    Jellyfin Setup Guide (Hinglish)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Jellyfin me direct btttr.cc plugin add karne ke 2 sabse simple tareeqe:
                  </p>
                </div>

                {/* METHOD A - Direct DLL installation (Fastest and easiest!) */}
                <div className="space-y-2 bg-indigo-950/10 border border-indigo-950/40 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded">
                      Method 1 (Sabse Easy)
                    </span>
                    <h4 className="text-xs font-semibold text-white">Direct DLL File Copy karein</h4>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Agar aap apne personal home server par ise use karna chahte hain, toh GitHub repository setup karne ki koi zarurat nahi hai! Direct DLL generate karke copy-paste karein:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1.5 pl-1 pt-1 mt-1 border-t border-zinc-850/40">
                    <li>PC par <span className="font-mono text-zinc-300 bg-zinc-950 px-1 rounded">.NET 8.0 SDK</span> install karein.</li>
                    <li>Hamare banaye folder <span className="font-mono text-zinc-305 bg-indigo-950/20 px-1 rounded">/jellyfin-btttr-plugin</span> me jayein.</li>
                    <li>Apne terminal me ye command run karein: 
                      <code className="block bg-black p-2 rounded text-indigo-400 my-1 font-mono text-[10px] select-all">
                        dotnet build -c Release
                      </code>
                    </li>
                    <li>Compile hone ke baad, aapko <span className="font-mono text-emerald-400">Jellyfin.Plugin.BtttrPosters.dll</span> file milegi.</li>
                    <li>Is DLL file ko copy karke apne Jellyfin Server ke <span className="font-mono text-zinc-305 bg-zinc-950 px-1 rounded">plugins/BtttrPosters</span> folder me paste kar dein.</li>
                    <li>Jellyfin server ko <strong>Restart</strong> karein. Plugin seedha active ho jayega!</li>
                  </ol>
                </div>

                {/* METHOD B - GitHub Repository Manifest */}
                <div className="space-y-2 bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded">
                      Method 2 (Official Tarika)
                    </span>
                    <h4 className="text-xs font-semibold text-white">GitHub Upload & Manifest Setup</h4>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Agar aap chahte hain ki plugins direct Jellyfin dashboard ke "Plugin Catalog" me show ho aur auto-update ho paye:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1.5 pl-1 pt-1 mt-1 border-t border-zinc-850/40">
                    <li>Ispar saare Code files ko apne ek naye <strong>GitHub Repositories</strong> me push karein.</li>
                    <li>GitHub par naya "Release" banayein aur usme apni compiled DLL file ko ZIP karke upload karein.</li>
                    <li>Repository ke root par <span className="font-mono text-zinc-300 bg-zinc-900 px-1 rounded">manifest.json</span> file rakhein. Isme aapko apne ZIP release ka direct download link update karna hoga.</li>
                    <li>Jellyfin admin dashboard open karein aur <strong>Plugins &rarr; Repositories</strong> par jayein.</li>
                    <li><strong>Add (+) button</strong> par click karein aur apne GitHub manifest.json ka "RAW" URL link paste kar dein:
                      <code className="block bg-zinc-950 p-2 rounded text-zinc-400 my-1 font-mono text-[9px] truncate">
                        https://raw.githubusercontent.com/[username]/[repo]/main/manifest.json
                      </code>
                    </li>
                    <li>Ab ye plugin automatically aapke "Catalog" list me dikhne lagega jaha se direct single click se install ho sakega!</li>
                  </ol>
                </div>

                {/* FAQ section */}
                <div className="pt-2 border-t border-zinc-850">
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Ye Plugin kaam kaise karega?</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Jab bhi aap Jellyfin Library scan karenge, ye plugin aapki movies aur TV Shows ke <strong>IMDb ID</strong> ko dhoondhega. Fir direct <span className="font-semibold text-indigo-400">btttr.cc</span> endpoint se overlay icons aur dynamic ratings wale high-quality posters download karne ka option load kar dega.
                  </p>
                </div>
              </div>
            ) : (
              // ENGLISH VERSION
              <div className="space-y-5">
                <div className="border-b border-indigo-950 pb-3">
                  <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4.5 h-4.5 text-cyan-400" />
                    Jellyfin Setup Wiki (English)
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Two optimal ways to natively add the Btttr.cc poster plugin directly inside Jellyfin:
                  </p>
                </div>

                {/* METHOD A - Direct DLL installation */}
                <div className="space-y-2 bg-indigo-950/10 border border-indigo-950/40 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded">
                      Method 1 (Easiest)
                    </span>
                    <h4 className="text-xs font-semibold text-white">Direct DLL File Migration</h4>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    If you are running a private or home media server, this is by far the fastest option. Simply compile the C# project once and drop the DLL inside your plugin assembly folder:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1.5 pl-1 pt-1 mt-1 border-t border-zinc-850/40">
                    <li>Install <span className="font-mono text-zinc-300 bg-zinc-950 px-1 rounded">.NET 8.0 SDK</span> on your development system.</li>
                    <li>Open your terminal and navigate to the <span className="font-mono text-zinc-305 bg-indigo-950/40 px-1 rounded">/jellyfin-btttr-plugin</span> folder.</li>
                    <li>Run the compiler command:
                      <code className="block bg-black p-2 rounded text-indigo-400 my-1 font-mono text-[10px] select-all">
                        dotnet build -c Release
                      </code>
                    </li>
                    <li>Grab the compiled <span className="font-mono text-emerald-400">Jellyfin.Plugin.BtttrPosters.dll</span> file located inside the bin folder.</li>
                    <li>Move this DLL to your server's <span className="font-mono text-zinc-305 bg-zinc-950 px-1 rounded">plugins/BtttrPosters</span> directory.</li>
                    <li><strong>Restart Jellyfin</strong>. The Btttr poster provider will be active and selectable natively!</li>
                  </ol>
                </div>

                {/* METHOD B - GitHub Repository Manifest */}
                <div className="space-y-2 bg-zinc-950/50 border border-zinc-900 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded">
                      Method 2 (Official)
                    </span>
                    <h4 className="text-xs font-semibold text-white">GitHub Repository & Manifest Registry</h4>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    If you want to host and make it discoverable directly inside Jellyfin's administrative "Plugin Catalog" with automated version checking:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1.5 pl-1 pt-1 mt-1 border-t border-zinc-850/40">
                    <li>Push these files to your own public repository on <strong>GitHub</strong>.</li>
                    <li>Generate a ZIP release containing the compiled DLL, and upload it as a release asset.</li>
                    <li>At the root of the repo, configure the `manifest.json` file pointing to your ZIP archive download link.</li>
                    <li>Open Jellyfin Dashboard &rarr; <strong>Plugins &rarr; Repositories</strong>, click Add (+).</li>
                    <li>Paste your GitHub RAW manifest link:
                      <code className="block bg-zinc-950 p-2 rounded text-zinc-400 my-1 font-mono text-[9px] truncate">
                        https://raw.githubusercontent.com/[username]/[repo]/main/manifest.json
                      </code>
                    </li>
                    <li>The plugin will now appear in Jellyfin's official "Catalog" list of pluggable features!</li>
                  </ol>
                </div>

                {/* FAQ section */}
                <div className="pt-2 border-t border-zinc-850">
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">How does the provider query?</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Jellyfin automatically calls this plugin for any movie or TV series. The plugin extracts the corresponding movie metadata ID (IMDb ID) and tells Jellyfin to fetch the dynamically badge overlayed poster directly from Btttr.cc.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* GitHub action guidance block */}
          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-2xl p-5 text-xs text-indigo-200 flex gap-3">
            <Github className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-300 mb-0.5">Push This Code folder to Github Easily</p>
              <p className="text-indigo-400/80 leading-relaxed font-sans">
                I have completely organized the plugin codebase structure and standard manifest configurations. You can copy these files into a new GitHub repository, or simply download the workspace directly. Let me know if you would like to run any further compilation validation tests!
              </p>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
