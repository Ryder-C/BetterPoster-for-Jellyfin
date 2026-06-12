using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.BtttrPosters.Configuration
{
    public class PluginConfiguration : BasePluginConfiguration
    {
        /// <summary>
        /// URL template used to fetch posters from btttr.cc.
        /// Supports the placeholder {imdb_id}, which is replaced at request time.
        /// Example: https://btttr.cc/poster-n/imdb/poster-default/{imdb_id}.jpg?tag=none
        /// </summary>
        public string UrlTemplate { get; set; } = "https://btttr.cc/poster-n/imdb/poster-default/{imdb_id}.jpg?tag=none";
    }
}
