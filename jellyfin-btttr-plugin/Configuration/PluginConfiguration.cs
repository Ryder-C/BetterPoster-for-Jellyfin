using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.BtttrPosters.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        public string LayoutStyle { get; set; } = "poster-default";

        /// <summary>
        /// URL template used to fetch posters from btttr.cc.
        /// Supports the placeholders {imdb_id} and {layout}.
        /// Example: https://btttr.cc/poster-n/imdb/poster-default/{imdb_id}.jpg?tag=none
        /// </summary>
        public string UrlTemplate { get; set; } = "https://btttr.cc/poster/imdb/{layout}/{imdb_id}.jpg";

        public bool FallbackToTmdbText { get; set; } = true;
    }
}
