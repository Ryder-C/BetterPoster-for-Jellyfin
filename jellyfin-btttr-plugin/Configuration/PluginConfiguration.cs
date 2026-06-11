using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.BtttrPosters.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public string LayoutStyle { get; set; } = "poster-default";
        
        public bool FallbackToTmdbText { get; set; } = true;
    }
}
