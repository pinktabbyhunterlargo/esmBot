#include <vips/vips8>

#include "common.h"

using namespace std;
using namespace vips;

char *ToGif(string type, string *outType, char *BufferData, size_t BufferLength,
            [[maybe_unused]] ArgumentMap Arguments, size_t *DataSize) {
  if (type == "gif") {
    *DataSize = BufferLength;
    char *data = (char *)malloc(BufferLength);
    memcpy(data, BufferData, BufferLength);
    return data;
  } else {
    VOption *options = VImage::option()->set("access", "sequential");

    VImage in = VImage::new_from_buffer(
        BufferData, BufferLength, "",
        type == "webp" ? options->set("n", -1) : options);

    void *buf;
    in.write_to_buffer(".gif", &buf, DataSize);
    *outType = "gif";

    return (char *)buf;
  }
}